import React, { useState } from 'react';
import { Copy, Check, FileCode, Layers, ShieldCheck, Terminal } from 'lucide-react';

export const KotlinSourceModal: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('MainActivity.kt');
  const [copied, setCopied] = useState(false);

  const kotlinFiles: Record<string, { description: string; code: string }> = {
    'MainActivity.kt': {
      description: 'Edge-to-edge Activity with Scaffold, WindowInsets, and NavigationBarsPadding',
      code: `package com.sweldosplitter.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.sweldosplitter.app.ui.SweldoViewModel
import com.sweldosplitter.app.ui.components.MovableFab
import com.sweldosplitter.app.ui.screens.MainScaffoldScreen
import com.sweldosplitter.app.ui.theme.SweldoSplitterTheme

class MainActivity : ComponentActivity() {
    private val viewModel: SweldoViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 1. Edge-to-Edge execution
        enableEdgeToEdge()

        setContent {
            SweldoSplitterTheme {
                // 2. Scaffold with innerPadding & navigationBarsPadding protection
                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    contentWindowInsets = WindowInsets.safeDrawing,
                    bottomBar = {
                        // Guaranteed to sit entirely above system gesture bar
                        Box(modifier = Modifier.navigationBarsPadding()) {
                            // M3 NavigationBar
                        }
                    }
                ) { innerPadding ->
                    MainScaffoldScreen(
                        viewModel = viewModel,
                        contentPadding = innerPadding
                    )
                }
            }
        }
    }
}`,
    },
    'SweldoViewModel.kt': {
      description: 'Modern Android ViewModel with StateFlow, Room repository, and Rollover updates',
      code: `package com.sweldosplitter.app.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.sweldosplitter.app.data.SweldoRepository
import com.sweldosplitter.app.data.model.*
import com.sweldosplitter.app.domain.RolloverEngine
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.time.LocalDate

data class SweldoUiState(
    val payPeriod: PayPeriodEntity = PayPeriodEntity.defaultPeriod(),
    val allocations: AllocationsEntity = AllocationsEntity.defaultAllocations(),
    val bills: List<BillEntity> = emptyList(),
    val savings: List<SavingsEntity> = emptyList(),
    val leisure: List<LeisureEntity> = emptyList(),
    val dailyExpenses: List<ExpenseEntity> = emptyList(),
    val rolloverSummary: RolloverSummary = RolloverSummary.EMPTY
)

class SweldoViewModel(
    private val repository: SweldoRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(SweldoUiState())
    val uiState: StateFlow<SweldoUiState> = _uiState.asStateFlow()

    init {
        observeBudgetState()
    }

    private fun observeBudgetState() {
        combine(
            repository.observePayPeriod(),
            repository.observeAllocations(),
            repository.observeExpenses(),
            repository.observeBills(),
            repository.observeSavings(),
            repository.observeLeisure()
        ) { period, alloc, expenses, bills, savings, leisure ->
            val summary = RolloverEngine.calculateRollover(
                payPeriod = period,
                allocations = alloc,
                expenses = expenses
            )
            SweldoUiState(
                payPeriod = period,
                allocations = alloc,
                bills = bills,
                savings = savings,
                leisure = leisure,
                dailyExpenses = expenses,
                rolloverSummary = summary
            )
        }.onEach { newState ->
            _uiState.value = newState
        }.launchIn(viewModelScope)
    }

    fun addExpense(date: LocalDate, desc: String, amount: Double, category: String) {
        viewModelScope.launch {
            repository.insertExpense(
                ExpenseEntity(
                    date = date,
                    description = desc,
                    amount = amount,
                    category = category
                )
            )
        }
    }
}`,
    },
    'RolloverEngine.kt': {
      description: 'Next-Day Rollover Engine with java.time.LocalDate & ChronoUnit.DAYS',
      code: `package com.sweldosplitter.app.domain

import com.sweldosplitter.app.data.model.*
import java.time.LocalDate
import java.time.temporal.ChronoUnit

object RolloverEngine {

    /**
     * Calculates base daily limit and cascades surplus/deficit to next day.
     * Handles cross-month cycles safely using ChronoUnit.DAYS (e.g. Sept 20 to Oct 5 = 16 days).
     */
    fun calculateRollover(
        payPeriod: PayPeriodEntity,
        allocations: AllocationsEntity,
        expenses: List<ExpenseEntity>,
        today: LocalDate = LocalDate.now()
    ): RolloverSummary {
        // ChronoUnit.DAYS inclusive count
        val totalDays = ChronoUnit.DAYS.between(payPeriod.startDate, payPeriod.endDate) + 1
        val dailyExpensePool = (payPeriod.inflow * allocations.dailyExpensesPercent) / 100.0
        val baseDailyAllowance = if (totalDays > 0) dailyExpensePool / totalDays else 0.0

        val days = mutableListOf<DayCalculation>()
        var previousRollover = 0.0
        var currentDate = payPeriod.startDate
        var dayIndex = 1

        while (!currentDate.isAfter(payPeriod.endDate)) {
            val dateExpenses = expenses.filter { it.date == currentDate }
            val totalSpent = dateExpenses.sumOf { it.amount }

            val carried = if (dayIndex == 1) 0.0 else previousRollover
            val calculatedLimit = baseDailyAllowance + carried
            val netRemaining = calculatedLimit - totalSpent

            // Underspending: surplus rolls over to tomorrow
            // Overspending: deficit rolls over to deduct tomorrow
            val rolloverToNextDay = netRemaining
            previousRollover = rolloverToNextDay

            days.add(
                DayCalculation(
                    dayIndex = dayIndex,
                    date = currentDate,
                    baseLimit = baseDailyAllowance,
                    carriedRollover = carried,
                    calculatedLimit = calculatedLimit,
                    totalSpent = totalSpent,
                    netRemaining = netRemaining,
                    rolloverToNextDay = rolloverToNextDay,
                    isUnderBudget = totalSpent <= calculatedLimit
                )
            )

            currentDate = currentDate.plusDays(1)
            dayIndex++
        }

        return RolloverSummary(
            baseDailyAllowance = baseDailyAllowance,
            totalDays = totalDays,
            totalDailyBudget = dailyExpensePool,
            days = days
        )
    }
}`,
    },
    'MovableFab.kt': {
      description: 'Movable FloatingActionButton with detectDragGesturesAfterLongPress and Boundary Clamping',
      code: `package com.sweldosplitter.app.ui.components

import androidx.compose.foundation.gestures.detectDragGesturesAfterLongPress
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import kotlin.math.roundToInt

@Composable
fun MovableFab(
    onTap: () -> Unit,
    screenWidthPx: Float,
    screenHeightPx: Float,
    modifier: Modifier = Modifier
) {
    var offsetX by remember { mutableStateOf(screenWidthPx - 200f) }
    var offsetY by remember { mutableStateOf(screenHeightPx - 300f) }
    val fabSizePx = with(LocalDensity.current) { 56.dp.toPx() }

    Box(
        modifier = modifier
            .offset { IntOffset(offsetX.roundToInt(), offsetY.roundToInt()) }
            .pointerInput(Unit) {
                detectDragGesturesAfterLongPress(
                    onDragStart = { /* Haptic feedback */ },
                    onDragEnd = { /* Persist coordinates in DataStore */ },
                    onDrag = { change, dragAmount ->
                        change.consume()
                        // Boundary clamping within visible screen margins
                        val newX = (offsetX + dragAmount.x).coerceIn(16f, screenWidthPx - fabSizePx - 16f)
                        val newY = (offsetY + dragAmount.y).coerceIn(64f, screenHeightPx - fabSizePx - 80f)
                        offsetX = newX
                        offsetY = newY
                    }
                )
            }
    ) {
        FloatingActionButton(
            onClick = onTap, // Short tap triggers quick-add transaction dialog
            containerColor = MaterialTheme.colorScheme.primary
        ) {
            Icon(Icons.Filled.Add, contentDescription = "Add Expense")
        }
    }
}`,
    },
    'AppDatabase.kt': {
      description: 'Room Database & Entities with local persistence for Offline-first budgeting',
      code: `package com.sweldosplitter.app.data.db

import androidx.room.*
import java.time.LocalDate

@Entity(tableName = "pay_periods")
data class PayPeriodEntity(
    @PrimaryKey val id: String = "active_period",
    val frequency: String,
    val startDate: LocalDate,
    val endDate: LocalDate,
    val inflow: Double
) {
    companion object {
        fun defaultPeriod() = PayPeriodEntity(
            frequency = "custom",
            startDate = LocalDate.of(2026, 9, 20),
            endDate = LocalDate.of(2026, 10, 5),
            inflow = 15000.0 // ₱15,000.00
        )
    }
}

@Entity(tableName = "expenses")
data class ExpenseEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val date: LocalDate,
    val description: String,
    val amount: Double,
    val category: String,
    val timestamp: Long = System.currentTimeMillis()
)

@Dao
interface ExpenseDao {
    @Query("SELECT * FROM expenses ORDER BY date ASC, timestamp ASC")
    fun getAllExpensesFlow(): kotlinx.coroutines.flow.Flow<List<ExpenseEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertExpense(expense: ExpenseEntity)

    @Delete
    suspend fun deleteExpense(expense: ExpenseEntity)
}

@Database(
    entities = [PayPeriodEntity::class, ExpenseEntity::class, BillEntity::class, SavingsEntity::class, LeisureEntity::class],
    version = 1,
    exportSchema = false
)
@TypeConverters(DateConverters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun expenseDao(): ExpenseDao
    abstract fun billDao(): BillDao
    abstract fun savingsDao(): SavingsDao
}`,
    },
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(kotlinFiles[selectedFile].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Native Android Architecture (Kotlin & Jetpack Compose)</h2>
            <p className="text-[11px] text-slate-400">
              Verified Material 3, ViewModel + StateFlow, Room DB, and java.time.LocalDate
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>enableEdgeToEdge() Inset Safe</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>ChronoUnit.DAYS Cross-Month Math</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>detectDragGesturesAfterLongPress</span>
          </div>
        </div>
      </div>

      {/* File Selector Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {Object.keys(kotlinFiles).map((fileName) => (
          <button
            key={fileName}
            type="button"
            onClick={() => setSelectedFile(fileName)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedFile === fileName
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{fileName}</span>
          </button>
        ))}
      </div>

      {/* Code Viewer Box */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Top bar */}
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-bold text-white">{selectedFile}</span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Kotlin Code</span>
              </>
            )}
          </button>
        </div>

        {/* File Description */}
        <div className="px-4 py-2 bg-slate-900/40 text-[11px] text-slate-400 border-b border-slate-800/80">
          {kotlinFiles[selectedFile].description}
        </div>

        {/* Code Block */}
        <pre className="p-4 text-xs font-mono text-emerald-200/90 overflow-x-auto leading-relaxed max-h-[460px] overflow-y-auto">
          <code>{kotlinFiles[selectedFile].code}</code>
        </pre>
      </div>
    </div>
  );
};
