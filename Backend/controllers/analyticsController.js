const { query } = require("../utils/dbQuery");

/* ==============================
   GET ANALYTICS DASHBOARD
============================== */

exports.getAnalytics = async (req, res, next) => {
  try {
    const [
      mostViewed,
      topCities,
      searchTrends,
      userActivity,
      revenue
    ] = await Promise.all([
      /* ----------------------------
         MOST VIEWED PROPERTIES
      ----------------------------- */
      query(
        `
        SELECT
          p.property_id,
          p.title,
          p.city,
          p.views,
          (
            SELECT image_url
            FROM property_images
            WHERE property_id = p.property_id
            ORDER BY image_id ASC
            LIMIT 1
          ) AS image
        FROM properties p
        WHERE p.verification_status = 'approved'
        ORDER BY p.views DESC
        LIMIT 5
        `
      ),

      /* ----------------------------
         TOP CITIES
      ----------------------------- */
      query(
        `
        SELECT
          city,
          COUNT(*)::int AS total_properties
        FROM properties
        WHERE city IS NOT NULL
        GROUP BY city
        ORDER BY total_properties DESC
        LIMIT 5
        `
      ),

      /* ----------------------------
         SEARCH TRENDS
      ----------------------------- */
      query(
        `
        SELECT
          city,
          COUNT(*)::int AS searches
        FROM search_logs
        WHERE city IS NOT NULL
        GROUP BY city
        ORDER BY searches DESC
        LIMIT 5
        `
      ),

      /* ----------------------------
         USER ACTIVITY (LAST 7 DAYS)
      ----------------------------- */
      query(
        `
        SELECT
          DATE(created_at) AS date,
          COUNT(*)::int AS new_users
        FROM users
        WHERE created_at >= NOW() - INTERVAL '7 days'
        GROUP BY date
        ORDER BY date ASC
        `
      ),

      /* ----------------------------
         REVENUE ANALYTICS
      ----------------------------- */
      query(
        `
        SELECT
          COALESCE(SUM(amount), 0)::numeric AS total_revenue
        FROM transactions
        WHERE LOWER(payment_status) = 'completed'
        `
      )
    ]);

    return res.status(200).json({
      success: true,
      data: {
        mostViewedProperties: mostViewed,
        topCities,
        searchTrends,
        userActivity,
        revenue: Number(revenue[0]?.total_revenue || 0)
      }
    });
  } catch (err) {
    next(err);
  }
};