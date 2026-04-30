const { query } = require("../utils/dbQuery");

/* =============================
   DASHBOARD STATS
============================= */

exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.user_id || req.user.id;
    const role = req.user.role;

    let summary = {};

    if (role === "buyer") {
      const [bookings, saved, transactions] = await Promise.all([
        query("SELECT COUNT(*)::int AS total FROM bookings WHERE user_id = $1", [userId]),
        query("SELECT COUNT(*)::int AS total FROM saved_properties WHERE user_id = $1", [userId]),
        query("SELECT COUNT(*)::int AS total FROM transactions WHERE buyer_id = $1", [userId])
      ]);

      summary = {
        totalBookings: bookings[0].total,
        totalSavedProperties: saved[0].total,
        totalTransactions: transactions[0].total
      };
    } else if (role === "seller" || role === "agent") {
      const [properties, views, bookings, transactions] = await Promise.all([
        query("SELECT COUNT(*)::int AS total FROM properties WHERE owner_id = $1", [userId]),
        query("SELECT COALESCE(SUM(views), 0)::int AS total FROM properties WHERE owner_id = $1", [userId]),
        query(
          `SELECT COUNT(*)::int AS total
           FROM bookings b
           JOIN properties p ON b.property_id = p.property_id
           WHERE p.owner_id = $1`,
          [userId]
        ),
        query("SELECT COUNT(*)::int AS total FROM transactions WHERE seller_id = $1", [userId])
      ]);

      summary = {
        totalProperties: properties[0].total,
        totalViews: views[0].total,
        totalBookings: bookings[0].total,
        totalTransactions: transactions[0].total
      };
    } else if (role === "admin") {
      const [users, properties, bookings, transactions, payments] = await Promise.all([
        query("SELECT COUNT(*)::int AS total FROM users"),
        query("SELECT COUNT(*)::int AS total FROM properties"),
        query("SELECT COUNT(*)::int AS total FROM bookings"),
        query("SELECT COUNT(*)::int AS total FROM transactions"),
        query("SELECT COALESCE(SUM(amount_paid), 0)::numeric AS total FROM payments")
      ]);

      summary = {
        totalUsers: users[0].total,
        totalProperties: properties[0].total,
        totalBookings: bookings[0].total,
        totalTransactions: transactions[0].total,
        totalRevenue: Number(payments[0].total)
      };
    }

    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (err) {
    next(err);
  }
};

/* =============================
   HOMEPAGE STATS
============================= */

exports.getHomepageStats = async (req, res, next) => {
  try {
    const [properties, users, cities] = await Promise.all([
      query("SELECT COUNT(*)::int AS total FROM properties WHERE verification_status = 'approved'"),
      query("SELECT COUNT(*)::int AS total FROM users WHERE is_active = true"),
      query(
        `SELECT COUNT(DISTINCT city)::int AS total
         FROM properties
         WHERE city IS NOT NULL AND verification_status = 'approved'`
      )
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalProperties: properties[0].total,
        totalUsers: users[0].total,
        totalCities: cities[0].total
      }
    });
  } catch (err) {
    next(err);
  }
};

/* =============================
   RECENT ACTIVITY
============================= */

exports.getRecentActivity = async (req, res, next) => {
  try {
    const role = req.user.role;
    const userId = req.user.user_id || req.user.id;

    let sql = `
      SELECT 'booking' AS type, b.booking_id AS id, b.booking_date AS created_at,
             CONCAT('Booking for ', p.title) AS description
      FROM bookings b
      JOIN properties p ON b.property_id = p.property_id
    `;

    const params = [];

    if (role === "buyer") {
      sql += " WHERE b.user_id = $1";
      params.push(userId);
    } else if (role === "seller" || role === "agent") {
      sql += " WHERE p.owner_id = $1";
      params.push(userId);
    }

    sql += " ORDER BY created_at DESC LIMIT 10";

    const activities = await query(sql, params);

    return res.status(200).json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (err) {
    next(err);
  }
};