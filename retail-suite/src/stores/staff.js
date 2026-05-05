import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  createEmployee,
  getEmployeesApi,
  deleteEmployeeApi,
  getEmployeeApi,

  getSalaryHistory,
  getAttendanceStats,

  createDepartmentApi,
  getDepartmentsApi,
  deleteDepartmentApi,
  getDesignationsApi,
  createDesignationApi,
  deleteDesignationApi,

  getRolesApi,
  createRoleApi,
  deleteRoleApi

  } from '@/services/api'

export const useStaffStore = defineStore("staff", () => {
  // State
  const staff = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Actions
  const fetchStaff = async (company, department) => {
    loading.value = true;
    try {
      // Replace with actual API call
      const response = await getEmployeesApi(company, department);
      console.log('fetchStaff :', response);
     if (response?.status === 'success') {
        staff.value = response.data;
        return response;
      } else {
        throw new Error(response?.message || 'Failed to fetch staff');
      }
      error.value = null;

    } catch (err) {
      error.value = err.message;
      console.error("Error fetching staff:", err);
    } finally {
      loading.value = false;
    }
  };

  const createStaff = async (staffData) => {
    loading.value = true;
    try {
      console.log("staffData",staffData)
      const response = await createEmployee(JSON.stringify(staffData))
      console.log('createStaff :', response);
        // Check the actual response data, not HTTP status
        if (response?.status === 'error') {
             console.error('Error:', response.message);
             return {
              status: 'error',
              message: response.message
            }
          // Show error to user
        } else {
           return {
              status: 'success',
              message: response.message || 'Employee created successfully',
              data: response
            }
        }
      } catch (err) {
          const errorMsg = err?.message || 'Failed to create employee'
          error.value = errorMsg
          console.error('Error creating staff:', err)

      return {
        status: 'error',
        message: errorMsg
      }
    } finally {
      loading.value = false
    }
  };


  const fetchstaffDetails = async (employeeName) => {
    loading.value = true;
    try {
      const response = await getEmployeeApi(employeeName);
      console.log('fetchstaffDetails :', response);
      if (response?.status === 'success') {
        return response.data
      } else {
        throw new Error(response?.message || 'Failed to fetch staff details');
      }
    } catch (err) {
      error.value = err.message;
      console.error("Error fetching staff details:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  const updateStaff = async (id, staffData) => {
    loading.value = true;
    try {
      const response = await fetch(`/api/staff/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(staffData),
      });

      if (!response.ok) throw new Error("Failed to update staff");

      const updated = await response.json();
      const index = staff.value.findIndex((s) => s.id === id);
      if (index >= 0) {
        staff.value[index] = updated;
      }
      return updated;
    } catch (err) {
      error.value = err.message;
      console.error("Error updating staff:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteStaff = async (employeeName) => {
    try {
      const response = await deleteEmployeeApi(employeeName)
      // Check the actual response data, not HTTP status
      if (response?.status === 'error') {
             console.error('Error:', response.message);
             return {
              status: 'error',
              message: response.message
            }
          // Show error to user
        } else {
          console.log('deleteStaff :', response);
           return {
              status: 'success',
              message: response.message || 'Employee deleted successfully',
              data: response
            }
        }
      } catch (err) {
          const errorMsg = err?.message || 'Failed to delete employee'
          error.value = errorMsg
          console.error('Error deleting staff:', err)

      return {
        status: 'error',
        message: errorMsg
      }
    }
  };


  const createDepartment = async (departmentData) => {
    try {
      const response = await createDepartmentApi(JSON.stringify(departmentData))
      // Check the actual response data, not HTTP status
      if (response?.status === 'error') {
             console.error('Error:', response.message);
             return {
              status: 'error',
              message: response.message
            }
          // Show error to user
        } else {
          console.log('createDepartment :', response);
           return {
              status: 'success',
              message: response.message || 'Department created successfully',
              data: response
            }
        }
      } catch (err) {
          const errorMsg = err?.message || 'Failed to create department'
          error.value = errorMsg
          console.error('Error creating department:', err)

      return {
        status: 'error',
        message: errorMsg
      }
    }
  };
  const getDepartments = async (company) => {
    try {
      const response = await getDepartmentsApi(company)
      // Check the actual response data, not HTTP status
      console.log('resssssssss:', response);
      if (response?.status === 'success') {
        console.log('getDepartments :', response.data, typeof response);
         return {
            status: 'success',
            message: response.message || 'Departments fetched successfully',
            data: response.data
          }
          // Show error to user
        } else {
          console.error('Error:', response);
          return {
           status: 'error',
           message: response.message
         }
        }
      } catch (err) {
          const errorMsg = err?.message || 'Failed to fetch departments'
          error.value = errorMsg
          console.error('Error fetching departments:', err)

      return {
        status: 'error',
        message: errorMsg
      }
    }
  };

  const deleteDepartment = async (departmentName) => {
    try {
      const response = await deleteDepartmentApi(departmentName)
      // Check the actual response data, not HTTP status
      if (response?.status === 'error') {
             console.error('Error:', response.message);
             return {
              status: 'error',
              message: response.message
            }
          // Show error to user
        } else {
          console.log('deleteDepartment :', response);
           return {
              status: 'success',
              message: response.message || 'Department deleted successfully',
              data: response
            }
        }
      } catch (err) {
          const errorMsg = err?.message || 'Failed to delete department'
          error.value = errorMsg
          console.error('Error deleting department:', err)

      return {
        status: 'error',
        message: errorMsg
      }
    }
  };

  const getDesignations = async () => {
    try {
      const response = await getDesignationsApi()
      // Check the actual response data, not HTTP status
      if (response?.status === 'success') {
        console.log('getDesignations :', response.data, typeof response);
         return {
            status: 'success',
            message: response.message || 'Designations fetched successfully',
            data: response.data
          }
          // Show error to user
        } else {
          console.error('Error:', response);
          return {
           status: 'error',
           message: response.message
         }
        }
      } catch (err) {
          const errorMsg = err?.message || 'Failed to fetch designations'
          error.value = errorMsg
          console.error('Error fetching designations:', err)

      return {
        status: 'error',
        message: errorMsg
      }
    }
  };
  const createDesignation = async (designationData) => {
    try {
      const response = await createDesignationApi(JSON.stringify(designationData))
      // Check the actual response data, not HTTP status
      if (response?.status === 'error') {
             console.error('Error:', response.message);
             return {
              status: 'error',
              message: response.message
            }
          // Show error to user
        } else {
          console.log('createDesignation :', response);
           return {
              status: 'success',
              message: response.message || 'Designation created successfully',
              data: response
            }
        }
      } catch (err) {
          const errorMsg = err?.message || 'Failed to create designation'
          error.value = errorMsg
          console.error('Error creating designation:', err)

      return {
        status: 'error',
        message: errorMsg
      }
    }
  };
  const deleteDesignation = async (designationName) => {
    try {
      const response = await deleteDesignationApi(designationName)
      // Check the actual response data, not HTTP status
      if (response?.status === 'error') {
             console.error('Error:', response.message);
             return {
              status: 'error',
              message: response.message
            }
          // Show error to user
        } else {
          console.log('deleteDesignation :', response);
           return {
              status: 'success',
              message: response.message || 'Designation deleted successfully',
              data: response
            }
        }
      } catch (err) {
          const errorMsg = err?.message || 'Failed to delete designation'
          error.value = errorMsg
          console.error('Error deleting designation:', err)

      return {
        status: 'error',
        message: errorMsg
      }
    }
  };

  const createRole = async (roleData) => {
    try {
      const response = await createRoleApi(JSON.stringify(roleData))
      // Check the actual response data, not HTTP status
      if (response?.status === 'error') {
             console.error('Error:', response.message);
             return {
              status: 'error',
              message: response.message
            }
          // Show error to user
        } else {
          console.log('createRole :', response);
           return {
              status: 'success',
              message: response.message || 'Role created successfully',
              data: response
            }
        }
      } catch (err) {
          const errorMsg = err?.message || 'Failed to create role'
          error.value = errorMsg
          console.error('Error creating role:', err)

      return {
        status: 'error',
        message: errorMsg
      }
    }
  };

  const getRoles = async () => {
    try {
      const response = await getRolesApi()
      // Check the actual response data, not HTTP status
      if (response?.status === 'success') {
        console.log('getRoles :', response.data, typeof response);
         return {
            status: 'success',
            message: response.message || 'Roles fetched successfully',
            data: response.data
          }
          // Show error to user
        } else {
          console.error('Error:', response);
          return {
           status: 'error',
           message: response.message
         }
        }
      } catch (err) {
          const errorMsg = err?.message || 'Failed to fetch roles'
          error.value = errorMsg
          console.error('Error fetching roles:', err)

      return {
        status: 'error',
        message: errorMsg
      }
    }
  };

  const deleteRole = async (roleName) => {
    try {
      const response = await deleteRoleApi(roleName)
      // Check the actual response data, not HTTP status
      if (response?.status === 'error') {
             console.error('Error:', response.message);
             return {
              status: 'error',
              message: response.message
            }
          // Show error to user
        } else {
          console.log('deleteRole :', response);
           return {
              status: 'success',
              message: response.message || 'Role deleted successfully',
              data: response
            }
        }
      } catch (err) {
          const errorMsg = err?.message || 'Failed to delete role'
          error.value = errorMsg
          console.error('Error deleting role:', err)

      return {
        status: 'error',
        message: errorMsg
      }
    }
  };

const getStaffAttendance = async (staffId, month = null, fromDate = null, toDate = null) => {
    loading.value = true
    error.value = null

    try {
      const params = new URLSearchParams({
        employee_name: staffId, // المتغير الأول: اسم الموظف
      })

      // المتغير الثاني: الشهر (إذا تم تحديده)
      if (month) {
        params.append('month', month) // مثال: '2025-01'
      }

      // المتغيرات الثالث والرابع: التاريخين (إذا تم تحديدهما)
      if (fromDate && toDate) {
        params.append('from_date', fromDate) // مثال: '2025-01-01'
        params.append('to_date', toDate)     // مثال: '2025-01-31'
      }

      const response = await getAttendanceStats(params.toString())
      console.log('getStaffAttendance :', response)
      if (!response.status) throw new Error("Failed to fetch attendance")


      return response
    } catch (err) {
      error.value = err.message
      console.error("Error fetching attendance:", err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getStaffSalaryHistory = async (employeeName) => {
     try {
      const response = await getSalaryHistory(employeeName);
      // console.log('getStaffSalaryHistory :', response);
      if (response?.status === 'success') {
        return response.data
      } else {
        throw new Error(response?.message || 'Failed to fetch salary history');
      }
    } catch (err) {
      error.value = err.message;
      console.error("Error fetching salary history:", err);
      throw err;
    }
  };

  const updateStaffSalary = async (staffId, salaryData) => {
    try {
      const response = await fetch(`/api/staff/${staffId}/salary`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(salaryData),
      });

      if (!response.ok) throw new Error("Failed to update salary");
      return await response.json();
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  const recordAttendance = async (staffId, attendanceData) => {
    try {
      const response = await fetch(`/api/staff/${staffId}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attendanceData),
      });

      if (!response.ok) throw new Error("Failed to record attendance");
      return await response.json();
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  };

  const searchStaff = (query) => {
    if (!query) return staff.value;

    const lowerQuery = query.toLowerCase();
    return staff.value.filter(
      (s) =>
        s.name.toLowerCase().includes(lowerQuery) ||
        s.employeeId.includes(query) ||
        s.email.toLowerCase().includes(lowerQuery)
    );
  };

  const getStaffByDepartment = (department) => {
    return staff.value.filter((s) => s.department === department);
  };

  // Getters
  const totalStaff = computed(() => staff.value.length);

  const activeStaff = computed(
    () => staff.value.filter((s) => s.status === "active").length
  );

  const staffOnLeave = computed(
    () => staff.value.filter((s) => s.status === "on_leave").length
  );

  const totalSalaries = computed(() =>
    staff.value.reduce((sum, s) => sum + (s.salary || 0), 0)
  );

  const averageSalary = computed(() => {
    if (staff.value.length === 0) return 0;
    return totalSalaries.value / staff.value.length;
  });

  const staffByDepartment = computed(() => {
    const departments = {};
    staff.value.forEach((s) => {
      if (!departments[s.department]) {
        departments[s.department] = [];
      }
      departments[s.department].push(s);
    });
    return departments;
  });

  const staffByStatus = computed(() => {
    return {
      active: staff.value.filter((s) => s.status === "active").length,
      inactive: staff.value.filter((s) => s.status === "inactive").length,
      on_leave: staff.value.filter((s) => s.status === "on_leave").length,
    };
  });

  const getStaffById = (id) => {
    return staff.value.find((s) => s.id === id);
  };

  return {
    // State
    staff,
    loading,
    error,

    // Actions
    fetchStaff,
    createStaff,
    fetchstaffDetails,
    updateStaff,
    deleteStaff,
    getStaffAttendance,
    getStaffSalaryHistory,
    updateStaffSalary,
    recordAttendance,
    searchStaff,
    getStaffByDepartment,
    getStaffById,
  //Department Action
    createDepartment,
    getDepartments,
    deleteDepartment,

  //Designation Action
    getDesignations,
    createDesignation,
    deleteDesignation,

  //Role Action
    createRole,
    getRoles,
    deleteRole,
    // Getters
    totalStaff,
    activeStaff,
    staffOnLeave,
    totalSalaries,
    averageSalary,
    staffByDepartment,
    staffByStatus,
  };
});
