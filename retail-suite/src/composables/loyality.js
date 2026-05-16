import { call } from 'frappe-ui'

const BASE_LOYALTY = "retail.retail.api.loyalty"

/**
 * Get loyalty summary for current customer
 * Returns: total_points, points_value, current_tier, next_tier, tier_progress, tiers[]
 */

export const getLoyaltySummary = async () => {
  try {
    const res = await call(`${BASE_LOYALTY}.get_loyalty_summary`)

    return res || {}

  }catch (error) {
        console.error("Error fetching loyalty summary:", error)
        return { status: "error", data: {}, message: String(error) }
  }
}

/**
 * Get points transaction history
 * @param {number} limit - number of records (default 20)
 * @param {number} offset - pagination offset
 */
export const getPointsHistory = async (limit = 20, offset = 0) => {
  try {
    const res = await call(`${BASE_LOYALTY}.get_points_history`,
        { limit, offset },
    )
    return res || {}
  } catch (error) {
    console.error("Error fetching points history:", error)
    return { status: "error", data: [], total: 0, message: String(error) }
  }
}

/**
 * Get available rewards from loyalty program
 */
export const getAvailableRewards = async () => {
  try {
    const res = await call(`${BASE_LOYALTY}.get_available_rewards`)
    return res || {}
  } catch (error) {
    console.error("Error fetching rewards:", error)
    return { status: "error", data: [], message: String(error) }
  }
}

/**
 * Redeem a reward
 * @param {string} rewardId - the reward row name from Loyalty Reward child table
 */
export const redeemReward = async (rewardId) => {
  try {
    const res = await call(`${BASE_LOYALTY}.redeem_reward`, {
      reward_id: rewardId,
    })
    return res || {}
  } catch (error) {
    const msg =
      error?.response?.data?._server_messages
        ? JSON.parse(error.response.data._server_messages)[0]
        : String(error)
    console.error("Error redeeming reward:", error)
    return { status: "error", data: {}, message: msg }
  }
}

/**
 * Get referral code for current customer
 */
export const getReferralCode = async () => {
  try {
    const res = await call(`${BASE_LOYALTY}.get_referral_code`)
    return res || {}
  } catch (error) {
    console.error("Error fetching referral code:", error)
    return { status: "error", data: {}, message: String(error) }
  }
}
