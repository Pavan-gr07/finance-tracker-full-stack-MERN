const Transaction = require('../models/transactionModel');
const mongoose = require("mongoose");

exports.analyticsController = async (req, res) => {
  try {
    const userId = req.userId;
    const { filter } = req.query; // e.g., 'current', '3months', '6months', 'year'

    // 1️⃣ CALCULATE DATE RANGE
    let startDate = new Date();
    const today = new Date();

    switch (filter) {
      case 'current':
        // Start of this month
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '3months':
        startDate.setMonth(today.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(today.getMonth() - 6);
        break;
      case 'year':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        // Default to 'year' or 'all time' if no filter provided
        startDate.setFullYear(today.getFullYear() - 1);
    }

    // Common Filter Object for all queries
    const dateFilter = {
      userId: new mongoose.Types.ObjectId(userId),
      date: { $gte: startDate } // Greater than or equal to start date
    };

    // 2️⃣ RUN QUERIES IN PARALLEL (Performance Boost)
    const [summaryResult, lineChartResult, categoryResult] = await Promise.all([

      // A. TOTAL SUMMARY (Income vs Expense)
      Transaction.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: "$type",
            total: { $sum: "$amount" },
          },
        },
      ]),

      // B. LINE CHART (Trends over time)
      Transaction.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" }, // 1-12
              type: "$type" // Group by Type too so we can separate Income/Expense
            },
            total: { $sum: "$amount" }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),

      // C. CATEGORY CHART (Expense Only)
      Transaction.aggregate([
        {
          $match: {
            ...dateFilter,
            type: "expense"
          }
        },
        {
          $group: {
            _id: "$category",
            total: { $sum: "$amount" }
          }
        },
        { $sort: { total: -1 } }
      ])
    ]);

    // 3️⃣ FORMAT DATA
    let totalIncome = 0;
    let totalExpense = 0;

    summaryResult.forEach((s) => {
      if (s._id === "income") totalIncome = s.total;
      if (s._id === "expense") totalExpense = s.total;
    });

    // We re-format the Line Chart data to be cleaner for the Frontend
    // Original Output: [{ _id: { year: 2024, month: 1, type: 'income' }, total: 500 }, ...]
    // We keep it raw here, but your Frontend 'useMemo' logic already handles the merging perfectly.

    // 4️⃣ THIS MONTH SPECIFIC (Optional Overlay)
    // Sometimes users want to see "This Month's" progress regardless of the global filter.
    // We can calculate this purely from the filter if filter === 'current', 
    // or run a tiny separate query if you always want "This Month" specific stats in a specific card.
    // For now, I will return the main summary as it respects the filter selected.

    res.json({
      totalIncome,
      totalExpense,
      last12Months: lineChartResult, // Renaming strictly for compatibility with your frontend types
      categoryChart: categoryResult,
      monthSummary: {
        // If filter is 'current', these match totalIncome/totalExpense
        // If filter is 'year', these are just totals for the year. 
        // You can rename this key to 'periodSummary' in frontend later for clarity.
        monthIncome: totalIncome,
        monthExpense: totalExpense,
      }
    });

  } catch (err) {
    console.error("Analytics Error:", err);
    res.status(500).json({ error: err.message });
  }
};