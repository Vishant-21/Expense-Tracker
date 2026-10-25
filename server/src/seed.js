import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { User } from './models/User.js';
import { Expense } from './models/Expense.js';

// Resolve directory and load .env from the server root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const seedDatabase = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('[Seed Error] MONGO_URI environment variable is missing.');
    process.exit(1);
  }

  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('[Seed] Database connected successfully.');

    // 1. Create or update Demo User
    const demoEmail = 'demo@spendwise.com';
    let user = await User.findOne({ email: demoEmail });

    if (!user) {
      user = await User.create({
        name: 'Demo User',
        email: demoEmail,
        password: 'Demo@123',
        monthlyBudget: 20000,
        currency: 'INR',
      });
      console.log(`[Seed] Created new demo user: ${user.email}`);
    } else {
      user.name = 'Demo User';
      user.password = 'Demo@123';
      user.monthlyBudget = 20000;
      user.currency = 'INR';
      await user.save();
      console.log(`[Seed] Demo user already exists. Refreshed profile and credentials for: ${user.email}`);
    }

    // 2. Remove ONLY this demo user's existing expenses (safe for repeated runs)
    const deleteResult = await Expense.deleteMany({ user: user._id });
    console.log(`[Seed] Purged ${deleteResult.deletedCount} previous expenses for demo user.`);

    // 3. Generate 31 realistic Indian student expenses across the last 6 months
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();

    // Helper for current month dates (clamped to today or valid past day in current month)
    const getCurrentMonthDate = (targetDay, hour = 12, minute = 30) => {
      const day = Math.min(Math.max(1, targetDay), Math.max(1, currentDay));
      return new Date(currentYear, currentMonth, day, hour, minute, 0);
    };

    // Helper for prior months (1 to 5 months ago)
    const getPastMonthDate = (monthsAgo, targetDay, hour = 14, minute = 0) => {
      const d = new Date(currentYear, currentMonth - monthsAgo, 1);
      const maxDays = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      const validDay = Math.min(targetDay, maxDays);
      return new Date(d.getFullYear(), d.getMonth(), validDay, hour, minute, 0);
    };

    const expensesData = [
      // Current Month (11 expenses, total = ₹16,350 -> exactly 81.75% of ₹20,000 budget to show 80%+ warning)
      {
        title: 'Student PG Accommodation Rent',
        amount: 8000,
        category: 'Rent',
        date: getCurrentMonthDate(1, 10, 0),
        note: 'Double sharing PG room rent with WiFi and electricity included',
      },
      {
        title: 'Campus Mess Monthly Advance',
        amount: 2800,
        category: 'Food',
        date: getCurrentMonthDate(3, 13, 0),
        note: 'Vegetarian hostel mess meal fee subscription for this month',
      },
      {
        title: 'Delhi Metro Smart Card Recharge',
        amount: 1500,
        category: 'Travel',
        date: getCurrentMonthDate(5, 9, 30),
        note: 'Monthly commute to college and coaching center',
      },
      {
        title: 'Data Structures & Algorithms Textbook',
        amount: 750,
        category: 'Books',
        date: getCurrentMonthDate(7, 16, 15),
        note: 'Prescribed engineering semester reference textbook',
      },
      {
        title: 'Jio 5G Prepaid 3-Month Plan',
        amount: 749,
        category: 'Other',
        date: getCurrentMonthDate(9, 11, 45),
        note: 'Unlimited calling and 2GB/day mobile data pack',
      },
      {
        title: 'PVR Cinemas Movie & Snacks',
        amount: 750,
        category: 'Fun',
        date: getCurrentMonthDate(11, 19, 0),
        note: 'Weekend blockbuster movie with hostel friends',
      },
      {
        title: 'College Canteen Chai & Samosa',
        amount: 450,
        category: 'Food',
        date: getCurrentMonthDate(12, 17, 30),
        note: 'Evening group discussions and refreshments at student union cafeteria',
      },
      {
        title: 'Swiggy Biryani Dinner with Friends',
        amount: 520,
        category: 'Food',
        date: getCurrentMonthDate(14, 21, 15),
        note: 'Late night exam study session treat',
      },
      {
        title: 'Hostel Laundry & Ironing Service',
        amount: 400,
        category: 'Other',
        date: getCurrentMonthDate(15, 14, 0),
        note: 'Monthly bulk washing of bedsheets and college uniforms',
      },
      {
        title: 'Classmate Spiral Notebooks & Ball Pens',
        amount: 330,
        category: 'Books',
        date: getCurrentMonthDate(16, 15, 0),
        note: 'Stationery and registers for semester practicals',
      },
      {
        title: 'Auto Rickshaw to Coaching Center',
        amount: 101,
        category: 'Travel',
        date: getCurrentMonthDate(17, 18, 0),
        note: 'Shared auto fare during evening rush hour',
      },

      // 1 Month Ago (4 expenses, total = ₹13,350)
      {
        title: 'Student PG Accommodation Rent',
        amount: 8000,
        category: 'Rent',
        date: getPastMonthDate(1, 2, 10, 0),
        note: 'PG accommodation and utility charges',
      },
      {
        title: 'Campus Mess Monthly Fee',
        amount: 2750,
        category: 'Food',
        date: getPastMonthDate(1, 5, 13, 0),
        note: 'Monthly food plan payment',
      },
      {
        title: 'Metro Card Monthly Pass',
        amount: 1400,
        category: 'Travel',
        date: getPastMonthDate(1, 8, 9, 0),
        note: 'Metro card top-up for daily university travel',
      },
      {
        title: 'Hostel Rooftop Birthday Celebration',
        amount: 1200,
        category: 'Fun',
        date: getPastMonthDate(1, 20, 20, 30),
        note: 'Split birthday cake and snacks with wingmates',
      },

      // 2 Months Ago (4 expenses, total = ₹10,570)
      {
        title: 'Student PG Accommodation Rent',
        amount: 8000,
        category: 'Rent',
        date: getPastMonthDate(2, 1, 11, 0),
        note: 'Room rent payment to PG owner',
      },
      {
        title: 'Higher Engineering Mathematics - B.S. Grewal',
        amount: 680,
        category: 'Books',
        date: getPastMonthDate(2, 7, 15, 30),
        note: 'Semester mathematics textbook from Nai Sarak book market',
      },
      {
        title: 'Zomato Pizza Treat with Roommates',
        amount: 640,
        category: 'Food',
        date: getPastMonthDate(2, 14, 21, 0),
        note: 'Celebrated completing the mid-term project submission',
      },
      {
        title: 'Replacement Laptop Charger from Nehru Place',
        amount: 1250,
        category: 'Other',
        date: getPastMonthDate(2, 22, 16, 0),
        note: 'Bought 65W fast charger adapter for laptop',
      },

      // 3 Months Ago (4 expenses, total = ₹12,370)
      {
        title: 'Student PG Accommodation Rent',
        amount: 8000,
        category: 'Rent',
        date: getPastMonthDate(3, 2, 10, 0),
        note: 'Monthly room rent and maintenance',
      },
      {
        title: 'Campus Mess Subscription',
        amount: 2700,
        category: 'Food',
        date: getPastMonthDate(3, 4, 12, 30),
        note: 'Dining hall mess coupon booklet',
      },
      {
        title: 'IRCTC Train Ticket to Hometown',
        amount: 890,
        category: 'Travel',
        date: getPastMonthDate(3, 18, 8, 0),
        note: 'Tatkal sleeper coach reservation for semester break visit',
      },
      {
        title: 'Smaaash Gaming Arcade & Bowling',
        amount: 780,
        category: 'Fun',
        date: getPastMonthDate(3, 25, 17, 0),
        note: 'Weekend hangout and bowling match with classmates',
      },

      // 4 Months Ago (4 expenses, total = ₹11,370)
      {
        title: 'Student PG Accommodation Rent',
        amount: 8000,
        category: 'Rent',
        date: getPastMonthDate(4, 1, 10, 30),
        note: 'Room rent for the month',
      },
      {
        title: 'Semester Textbooks & Lab Manual Binding',
        amount: 1100,
        category: 'Books',
        date: getPastMonthDate(4, 6, 14, 0),
        note: 'Hardcopy lab files and technical book Xerox copies',
      },
      {
        title: 'South Indian Tiffin & Evening Mess',
        amount: 1850,
        category: 'Food',
        date: getPastMonthDate(4, 15, 19, 0),
        note: 'Dosa, idli and tiffin meals near campus gate',
      },
      {
        title: 'Campus Health Center & Prescription Medicines',
        amount: 420,
        category: 'Other',
        date: getPastMonthDate(4, 21, 11, 0),
        note: 'Doctor consultation fee and fever/cough medications',
      },

      // 5 Months Ago (4 expenses, total = ₹11,770)
      {
        title: 'Student PG Accommodation Rent',
        amount: 8000,
        category: 'Rent',
        date: getPastMonthDate(5, 2, 10, 0),
        note: 'Initial room rent deposit and monthly stay',
      },
      {
        title: 'City Bus Pass & Shared Auto Commute',
        amount: 1200,
        category: 'Travel',
        date: getPastMonthDate(5, 7, 9, 0),
        note: 'Student discounted seasonal transit pass',
      },
      {
        title: 'Campus Canteen & Evening Maggi/Tea',
        amount: 1650,
        category: 'Food',
        date: getPastMonthDate(5, 16, 18, 0),
        note: 'Canteen food and snack expenses throughout the month',
      },
      {
        title: 'Weekend Movie & Food Court Outing',
        amount: 920,
        category: 'Fun',
        date: getPastMonthDate(5, 24, 20, 0),
        note: 'Cinema tickets and South Indian dinner at mall food court',
      },
    ];

    // Attach demo user ID to each expense
    const expensesWithUser = expensesData.map((exp) => ({
      ...exp,
      user: user._id,
    }));

    await Expense.insertMany(expensesWithUser);

    // Calculate current month total for verification
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
    const currentMonthExpenses = expensesWithUser.filter(
      (e) => e.date >= startOfMonth && e.date <= endOfMonth
    );
    const currentMonthTotal = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const spendingPercentage = ((currentMonthTotal / user.monthlyBudget) * 100).toFixed(1);

    console.log('====================================================');
    console.log('  SpendWise Database Seed Completed Successfully!  ');
    console.log('====================================================');
    console.log(`Demo User:            ${user.name} (${user.email})`);
    console.log(`Monthly Budget:       ₹${user.monthlyBudget.toLocaleString('en-IN')} (${user.currency})`);
    console.log(`Total Expenses:       ${expensesWithUser.length} expenses across 6 months`);
    console.log(`Current Month Total:  ₹${currentMonthTotal.toLocaleString('en-IN')} (${spendingPercentage}% of budget)`);
    console.log(`Dashboard Status:     Yellow Warning active (>= 80% threshold)`);
    console.log('====================================================');

    await mongoose.disconnect();
    console.log('[Seed] Database disconnected cleanly.');
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] Operation failed: ${error.message}`);
    try {
      await mongoose.disconnect();
    } catch {
      // ignore disconnect error on failure
    }
    process.exit(1);
  }
};

seedDatabase();
