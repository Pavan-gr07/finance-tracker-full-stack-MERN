const Transaction = require('../models/transactionModel');
const mongoose = require("mongoose");

exports.analyticsController = async (req, res) => {
  try {
    const userId = req.userId;

    // 1️⃣ SUMMARY: total income & expense
    const summary = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    summary.forEach((s) => {
      if (s._id === "income") totalIncome = s.total;
      if (s._id === "expense") totalExpense = s.total;
    });

    // 2️⃣ LINE CHART: monthly spending (12 months)
    const last12Months = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          total: { $sum: "$amount" },
          type: { $first: "$type" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // 3️⃣ CATEGORY CHART: category-wise spending
    const categoryChart = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), type: "expense" } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // 4️⃣ THIS MONTH SUMMARY
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const thisMonth = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: start } } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" }
        }
      }
    ]);

    let monthIncome = 0;
    let monthExpense = 0;
    thisMonth.forEach(s => {
      if (s._id === "income") monthIncome = s.total;
      if (s._id === "expense") monthExpense = s.total;
    });

    res.json({
      totalIncome,
      totalExpense,
      last12Months,
      categoryChart,
      monthSummary: {
        monthIncome,
        monthExpense,
      }
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}