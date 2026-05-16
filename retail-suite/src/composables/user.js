import { call } from 'frappe-ui'


const USER_BASE = '/api/method/retail.retail.api.user_management'

// ============================================================
// Get current user info
// ============================================================

export const getCurrentUserInfo = async () => {
  try {
    const res = await call(`${USER_BASE}.get_current_user_info`)
    return {
      status: 'success',
      data: res || {}
    }
  } catch (error) {
    console.error('Error fetching current user:', error)
    throw error
  }
}

// ============================================================
// Get all users
// ============================================================
export const getAllUsers = async () => {
  try {
    const res = await call(`${USER_BASE}.get_all_users`)
    return {
      status: 'success',
      data: res || []
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

// ============================================================
// Get Create user
// ============================================================
export const createUser = async (userData) => {
  try {
    const res = await call(`${USER_BASE}.create_user`, {
      data: JSON.stringify(userData)
    })
    return {
      status: 'success',
      data: res.data.message?.data || {},
      message: res.data.message?.message || 'User created'
    }
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

// ============================================================
// Get Update user
// ============================================================
export const updateUser = async (name, userData) => {
  try {
    const res = await call(`${USER_BASE}.update_user`, {
      name,
      data: JSON.stringify(userData)
    })
    return {
      status: 'success',
      data: res || {},
      message: res || 'User updated'
    }
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

// ============================================================
// Get Delete (disable) user
// ============================================================
export const deleteUser = async (name) => {
  try {
    const res = await call(`${USER_BASE}.delete_user`, { name })
    return {
      status: 'success',
      message: res || 'User disabled'
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}
// ============================================================
// API change User Password
// ============================================================
export const changeUserPasswordApi = async ({ old_password, new_password, user }) => {
  try {
    const res = await call(
      'frappe.client.set_value',
      {
        doctype: 'User',
        name: user,
        fieldname: 'new_password',
        value: new_password
      }
    )
    return res
  } catch (err) {
    console.error('change Password Api:', err)
    throw err
  }
}
