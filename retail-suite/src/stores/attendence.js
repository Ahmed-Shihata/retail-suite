import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  createAttendanceRecord,
  EditAttendanceRecord,
  getAttendenceApi,
  deleteAttendanceApi,
  deleteMultipleAttendanceApi,
  deleteAttendanceByDateRangeApi,
  deleteAttendanceByEmployeeApi,
  createLeaveRequest,
  updateLeaveRequest,
  getLeaveRequests,
  deleteLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
  cancelLeaveRequest,
  getLeaveBalance,
  getLeaveStatistics
} from '@/services/api.js'

export const useAttendanceStore = defineStore('attendance', () => {
  /* ========================
     State - Attendance
  ======================== */
  const attendanceRecords = ref([])
  const loading = ref(false)
  const error = ref(null)

  /* ========================
     State - Leave
  ======================== */
  const leaveRequests = ref([])
  const leaveLoading = ref(false)
  const leaveError = ref(null)

  /* ========================
     ATTENDANCE - Create
  ======================== */
  const addAttendanceRecord = async (attendanceData) => {
    try {
      loading.value = true
      error.value = null

      console.log('Adding attendance record:', attendanceData)

      const response = await createAttendanceRecord({
        employee: attendanceData.employee,
        attendance_date: attendanceData.attendance_date,
        status: attendanceData.status,
        shift: attendanceData.shift,
        leave_type: attendanceData.leave_type || '',
        late_entry: attendanceData.late_entry || false,
        early_exit: attendanceData.early_exit || false
      })

      console.log('Attendance record created:', response)
      return {
        status: response.status,
        data: response.data,
        message: response.message
      }
    } catch (err) {
      error.value = err.message
      console.error('Error adding attendance record:', err)

      return {
        status: 'error',
        data: {},
        message: err.message || 'Failed to create attendance record'
      }
    } finally {
      loading.value = false
    }
  }

  /* ========================
     ATTENDANCE - Edit
  ======================== */
  const editAttendanceRecord = async (attendanceData) => {
    try {
      loading.value = true
      error.value = null

      console.log('Editing attendance record:', attendanceData)

      const response = await EditAttendanceRecord(attendanceData)

      console.log('Attendance record edited:', response)
      return {
        status: response.status,
        data: response.data,
        message: response.message
      }
    } catch (err) {
      error.value = err.message
      console.error('Error editing attendance record:', err)

      return {
        status: 'error',
        data: {},
        message: err.message || 'Failed to edit attendance record'
      }
    } finally {
      loading.value = false
    }
  }

  /* ========================
     ATTENDANCE - Read
  ======================== */
  const fetchAttendances = async () => {
    try {
      loading.value = true
      error.value = null

      console.log('Fetching attendance records...')

      const response = await getAttendenceApi()

      console.log('Fetched attendance records:', response)

      attendanceRecords.value = response.message?.data || response.data || []

      return {
        status: 'success',
        data: attendanceRecords.value,
        message: 'Attendance records fetched successfully'
      }
    } catch (err) {
      error.value = err.message
      console.error('Error fetching attendance records:', err)

      return {
        status: 'error',
        data: [],
        message: err.message || 'Failed to fetch attendance records'
      }
    } finally {
      loading.value = false
    }
  }

  /* ========================
     ATTENDANCE - Delete Single
  ======================== */
  const deleteAttendance = async (attendanceId) => {
    try {
      loading.value = true
      error.value = null

      console.log('Deleting attendance record:', attendanceId)

      const response = await deleteAttendanceApi(attendanceId)

      if (response.status === 'success') {
        attendanceRecords.value = attendanceRecords.value.filter(
          record => record.name !== attendanceId
        )
      }

      return response
    } catch (err) {
      error.value = err.message
      console.error('Error deleting attendance record:', err)

      return {
        status: 'error',
        data: {},
        message: err.message || 'Failed to delete attendance record'
      }
    } finally {
      loading.value = false
    }
  }

  /* ========================
     ATTENDANCE - Delete Multiple
  ======================== */
  const deleteMultipleAttendance = async (attendanceIds) => {
    try {
      loading.value = true
      error.value = null

      if (!Array.isArray(attendanceIds) || attendanceIds.length === 0) {
        throw new Error('No attendance records selected')
      }

      console.log('Deleting multiple attendance records:', attendanceIds)

      const response = await deleteMultipleAttendanceApi(attendanceIds)

      if (response.status === 'success' || response.status === 'partial') {
        const deletedIds = response.deleted || []

        attendanceRecords.value = attendanceRecords.value.filter(
          record => !deletedIds.includes(record.name)
        )
      }

      return response
    } catch (err) {
      error.value = err.message
      console.error('Error deleting multiple attendance records:', err)

      return {
        status: 'error',
        deleted: [],
        failed: [],
        message: err.message || 'Failed to delete attendance records'
      }
    } finally {
      loading.value = false
    }
  }

  /* ========================
     ATTENDANCE - Delete by Date Range
  ======================== */
  const deleteAttendanceByDateRange = async (startDate, endDate) => {
    try {
      loading.value = true
      error.value = null

      if (!startDate || !endDate) {
        throw new Error('Start date and end date are required')
      }

      console.log(`Deleting attendance records from ${startDate} to ${endDate}`)

      const response = await deleteAttendanceByDateRangeApi(startDate, endDate)

      if (response.status === 'success') {
        attendanceRecords.value = attendanceRecords.value.filter(record => {
          const recordDate = record.attendance_date
          return recordDate < startDate || recordDate > endDate
        })
      }

      return response
    } catch (err) {
      error.value = err.message
      console.error('Error deleting attendance by date range:', err)

      return {
        status: 'error',
        data: {},
        message: err.message || 'Failed to delete attendance records'
      }
    } finally {
      loading.value = false
    }
  }

  /* ========================
     ATTENDANCE - Delete by Employee
  ======================== */
  const deleteAttendanceByEmployee = async (employeeId, startDate = null, endDate = null) => {
    try {
      loading.value = true
      error.value = null

      if (!employeeId) {
        throw new Error('Employee ID is required')
      }

      console.log(`Deleting attendance records for employee: ${employeeId}`)

      const response = await deleteAttendanceByEmployeeApi(employeeId, startDate, endDate)

      if (response.status === 'success') {
        attendanceRecords.value = attendanceRecords.value.filter(record => {
          if (record.employee !== employeeId) return true

          if (startDate && endDate) {
            const recordDate = record.attendance_date
            return recordDate < startDate || recordDate > endDate
          }

          return false
        })
      }

      return response
    } catch (err) {
      error.value = err.message
      console.error('Error deleting employee attendance:', err)

      return {
        status: 'error',
        data: {},
        message: err.message || 'Failed to delete employee attendance records'
      }
    } finally {
      loading.value = false
    }
  }

  /* ========================
     ATTENDANCE - Clear All
  ======================== */
  const clearAllAttendance = () => {
    attendanceRecords.value = []
    error.value = null
  }

  /* ========================
     ATTENDANCE - Getters
  ======================== */
  const getAttendanceById = (id) => {
    return attendanceRecords.value.find(record => record.name === id)
  }

  const getAttendanceByEmployee = (employeeId) => {
    return attendanceRecords.value.filter(record => record.employee === employeeId)
  }

  const getAttendanceByDateRange = (startDate, endDate) => {
    return attendanceRecords.value.filter(record => {
      const recordDate = record.attendance_date
      return recordDate >= startDate && recordDate <= endDate
    })
  }

  const getAttendanceByStatus = (status) => {
    return attendanceRecords.value.filter(record => record.status === status)
  }

  /* ========================
     LEAVE - Create
  ======================== */
  const addLeaveRequest = async (leaveData) => {
    try {
      leaveLoading.value = true
      leaveError.value = null

      console.log('Adding leave request:', leaveData)

      const response = await createLeaveRequest({
        employee: leaveData.employeeId,
        employee_name: leaveData.employeeName,
        leave_type: leaveData.leaveType,
        company: leaveData.company,
        from_date: leaveData.fromDate,
        to_date: leaveData.toDate,
        number_of_days: leaveData.numberOfDays,
        reason: leaveData.reason || '',
        leave_approver: leaveData.leaveApproverId,
        leave_approver_name: leaveData.leaveApprover,
        status: leaveData.status || 'Pending'
      })

      console.log('Leave request created:', response)

      return {
        status: response.status || 'success',
        data: response.data || response.message,
        message: response.message || 'Leave request created successfully'
      }
    } catch (err) {
      leaveError.value = err.message
      console.error('Error adding leave request:', err)

      return {
        status: 'error',
        data: {},
        message: err.message || 'Failed to create leave request'
      }
    } finally {
      leaveLoading.value = false
    }
  }

  /* ========================
     LEAVE - Update
  ======================== */
  const updateLeave = async (leaveData) => {
    try {
      leaveLoading.value = true
      leaveError.value = null

      console.log('Updating leave request:', leaveData)

      const response = await updateLeaveRequest({
        name: leaveData.id,
        employee: leaveData.employeeId,
        employee_name: leaveData.employeeName,
        leave_type: leaveData.leaveType,
        company: leaveData.company,
        from_date: leaveData.fromDate,
        to_date: leaveData.toDate,
        number_of_days: leaveData.numberOfDays,
        reason: leaveData.reason || '',
        leave_approver: leaveData.leaveApproverId,
        leave_approver_name: leaveData.leaveApprover,
        status: leaveData.status
      })

      console.log('Leave request updated:', response)

      return {
        status: response.status || 'success',
        data: response.data || response.message,
        message: response.message || 'Leave request updated successfully'
      }
    } catch (err) {
      leaveError.value = err.message
      console.error('Error updating leave request:', err)

      return {
        status: 'error',
        data: {},
        message: err.message || 'Failed to update leave request'
      }
    } finally {
      leaveLoading.value = false
    }
  }

  /* ========================
     LEAVE - Read
  ======================== */
  const fetchLeaveRequests = async (filters = {}) => {
    try {
      leaveLoading.value = true
      leaveError.value = null

      console.log('Fetching leave requests...', filters)

      const response = await getLeaveRequests(filters)

      console.log('Fetched leave requests:', response)

      leaveRequests.value = response.message?.data || response.data || []

      return {
        status: 'success',
        data: leaveRequests.value,
        message: 'Leave requests fetched successfully'
      }
    } catch (err) {
      leaveError.value = err.message
      console.error('Error fetching leave requests:', err)

      return {
        status: 'error',
        data: [],
        message: err.message || 'Failed to fetch leave requests'
      }
    } finally {
      leaveLoading.value = false
    }
  }

  /* ========================
     LEAVE - Delete
  ======================== */
  const deleteLeave = async (leaveId) => {
    try {
      leaveLoading.value = true
      leaveError.value = null

      console.log('Deleting leave request:', leaveId)

      const response = await deleteLeaveRequest(leaveId)

      if (response.status === 'success' || response.status === 201) {
        leaveRequests.value = leaveRequests.value.filter(
          leave => leave.name !== leaveId
        )
      }

      return {
        status: response.status || 'success',
        message: response.message || 'Leave request deleted successfully'
      }
    } catch (err) {
      leaveError.value = err.message
      console.error('Error deleting leave request:', err)

      return {
        status: 'error',
        message: err.message || 'Failed to delete leave request'
      }
    } finally {
      leaveLoading.value = false
    }
  }

  /* ========================
     LEAVE - Approve
  ======================== */
  const approveLeave = async (leaveId) => {
    try {
      leaveLoading.value = true
      leaveError.value = null

      console.log('Approving leave request:', leaveId)

      const response = await approveLeaveRequest(leaveId)

      if (response.status === 'success') {
        const leave = leaveRequests.value.find(l => l.name === leaveId)
        if (leave) {
          leave.status = 'Approved'
        }
      }

      return {
        status: response.status || 'success',
        message: response.message || 'Leave request approved successfully'
      }
    } catch (err) {
      leaveError.value = err.message
      console.error('Error approving leave request:', err)

      return {
        status: 'error',
        message: err.message || 'Failed to approve leave request'
      }
    } finally {
      leaveLoading.value = false
    }
  }

  /* ========================
     LEAVE - Reject
  ======================== */
  const rejectLeave = async (leaveId) => {
    try {
      leaveLoading.value = true
      leaveError.value = null

      console.log('Rejecting leave request:', leaveId)

      const response = await rejectLeaveRequest(leaveId)

      if (response.status === 'success') {
        const leave = leaveRequests.value.find(l => l.name === leaveId)
        if (leave) {
          leave.status = 'Rejected'
        }
      }

      return {
        status: response.status || 'success',
        message: response.message || 'Leave request rejected successfully'
      }
    } catch (err) {
      leaveError.value = err.message
      console.error('Error rejecting leave request:', err)

      return {
        status: 'error',
        message: err.message || 'Failed to reject leave request'
      }
    } finally {
      leaveLoading.value = false
    }
  }

  /* ========================
     LEAVE - Cancel
  ======================== */
  const cancelLeave = async (leaveId) => {
    try {
      leaveLoading.value = true
      leaveError.value = null

      console.log('Cancelling leave request:', leaveId)

      const response = await cancelLeaveRequest(leaveId)

      if (response.status === 'success') {
        const leave = leaveRequests.value.find(l => l.name === leaveId)
        if (leave) {
          leave.status = 'Cancelled'
        }
      }

      return {
        status: response.status || 'success',
        message: response.message || 'Leave request cancelled successfully'
      }
    } catch (err) {
      leaveError.value = err.message
      console.error('Error cancelling leave request:', err)

      return {
        status: 'error',
        message: err.message || 'Failed to cancel leave request'
      }
    } finally {
      leaveLoading.value = false
    }
  }

  /* ========================
     LEAVE - Get Balance
  ======================== */
  const fetchLeaveBalance = async (employeeId) => {
    try {
      leaveLoading.value = true
      leaveError.value = null

      console.log('Fetching leave balance for employee:', employeeId)

      const response = await getLeaveBalance(employeeId)

      return {
        status: response.status || 'success',
        data: response.data || {},
        message: response.message || 'Leave balance fetched successfully'
      }
    } catch (err) {
      leaveError.value = err.message
      console.error('Error fetching leave balance:', err)

      return {
        status: 'error',
        data: {},
        message: err.message || 'Failed to fetch leave balance'
      }
    } finally {
      leaveLoading.value = false
    }
  }

  /* ========================
     LEAVE - Get Statistics
  ======================== */
  const fetchLeaveStatistics = async (filters = {}) => {
    try {
      leaveLoading.value = true
      leaveError.value = null

      console.log('Fetching leave statistics...', filters)

      const response = await getLeaveStatistics(filters)

      return {
        status: response.status || 'success',
        data: response.data || {},
        message: response.message || 'Leave statistics fetched successfully'
      }
    } catch (err) {
      leaveError.value = err.message
      console.error('Error fetching leave statistics:', err)

      return {
        status: 'error',
        data: {},
        message: err.message || 'Failed to fetch leave statistics'
      }
    } finally {
      leaveLoading.value = false
    }
  }

  /* ========================
     LEAVE - Clear All
  ======================== */
  const clearAllLeaves = () => {
    leaveRequests.value = []
    leaveError.value = null
  }

  /* ========================
     LEAVE - Getters
  ======================== */
  const getLeaveById = (id) => {
    return leaveRequests.value.find(leave => leave.name === id)
  }

  const getLeaveByEmployee = (employeeId) => {
    return leaveRequests.value.filter(leave => leave.employee === employeeId)
  }

  const getLeaveByStatus = (status) => {
    return leaveRequests.value.filter(leave => leave.status === status)
  }

  const getLeaveByType = (leaveType) => {
    return leaveRequests.value.filter(leave => leave.leave_type === leaveType)
  }

  const getPendingLeaves = () => {
    return leaveRequests.value.filter(leave => leave.status === 'Pending')
  }

  const getApprovedLeaves = () => {
    return leaveRequests.value.filter(leave => leave.status === 'Approved')
  }

  const getTotalLeavesDays = (employeeId) => {
    return leaveRequests.value
      .filter(leave => leave.employee === employeeId && leave.status === 'Approved')
      .reduce((total, leave) => total + leave.number_of_days, 0)
  }

  /* ========================
     Return Public API
  ======================== */
  return {
    // State - Attendance
    attendanceRecords,
    loading,
    error,

    // State - Leave
    leaveRequests,
    leaveLoading,
    leaveError,

    // Attendance Actions
    addAttendanceRecord,
    editAttendanceRecord,
    fetchAttendances,
    deleteAttendance,
    deleteMultipleAttendance,
    deleteAttendanceByDateRange,
    deleteAttendanceByEmployee,
    clearAllAttendance,

    // Attendance Getters
    getAttendanceById,
    getAttendanceByEmployee,
    getAttendanceByDateRange,
    getAttendanceByStatus,

    // Leave Actions
    addLeaveRequest,
    updateLeave,
    fetchLeaveRequests,
    deleteLeave,
    approveLeave,
    rejectLeave,
    cancelLeave,
    fetchLeaveBalance,
    fetchLeaveStatistics,
    clearAllLeaves,

    // Leave Getters
    getLeaveById,
    getLeaveByEmployee,
    getLeaveByStatus,
    getLeaveByType,
    getPendingLeaves,
    getApprovedLeaves,
    getTotalLeavesDays
  }
})
