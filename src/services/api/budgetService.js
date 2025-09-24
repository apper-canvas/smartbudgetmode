const { ApperClient } = window.ApperSDK;

export const budgetService = {
  getApperClient() {
    return new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
  },

  async getAll() {
    try {
      const apperClient = this.getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "monthly_limit_c"}},
          {"field": {"Name": "month_c"}},
          {"field": {"Name": "year_c"}}
        ]
      };
      
      const response = await apperClient.fetchRecords('budget_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching budgets:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = this.getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "monthly_limit_c"}},
          {"field": {"Name": "month_c"}},
          {"field": {"Name": "year_c"}}
        ]
      };
      
      const response = await apperClient.getRecordById('budget_c', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching budget ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async create(budgetData) {
    try {
      const apperClient = this.getApperClient();
      const params = {
        records: [{
          Name: budgetData.Name || budgetData.category_c || '',
          category_c: budgetData.category_c,
          monthly_limit_c: parseFloat(budgetData.monthly_limit_c),
          month_c: budgetData.month_c,
          year_c: parseInt(budgetData.year_c)
        }]
      };
      
      const response = await apperClient.createRecord('budget_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      if (response.results && response.results.length > 0) {
        const successful = response.results.filter(r => r.success);
        if (successful.length > 0) {
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error creating budget:", error?.response?.data?.message || error);
      return null;
    }
  },

  async update(id, budgetData) {
    try {
      const apperClient = this.getApperClient();
      const params = {
        records: [{
          Id: parseInt(id),
          Name: budgetData.Name || budgetData.category_c || '',
          category_c: budgetData.category_c,
          monthly_limit_c: parseFloat(budgetData.monthly_limit_c),
          month_c: budgetData.month_c,
          year_c: parseInt(budgetData.year_c)
        }]
      };
      
      const response = await apperClient.updateRecord('budget_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      if (response.results && response.results.length > 0) {
        const successful = response.results.filter(r => r.success);
        if (successful.length > 0) {
          return successful[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error updating budget:", error?.response?.data?.message || error);
      return null;
    }
  },

  async delete(id) {
    try {
      const apperClient = this.getApperClient();
      const params = { 
        RecordIds: [parseInt(id)]
      };
      
      const response = await apperClient.deleteRecord('budget_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return false;
      }
      
      if (response.results && response.results.length > 0) {
        return response.results.filter(r => r.success).length > 0;
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting budget:", error?.response?.data?.message || error);
      return false;
    }
  },

  async getByMonth(monthYear) {
    try {
      const apperClient = this.getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "monthly_limit_c"}},
          {"field": {"Name": "month_c"}},
          {"field": {"Name": "year_c"}}
        ],
        where: [{"FieldName": "month_c", "Operator": "EqualTo", "Values": [monthYear]}]
      };
      
      const response = await apperClient.fetchRecords('budget_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching budgets by month:", error?.response?.data?.message || error);
      return [];
    }
  },

  async upsertBudget(category, monthlyLimit, month, year) {
    try {
      const apperClient = this.getApperClient();
      
      // First check if budget already exists
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "monthly_limit_c"}},
          {"field": {"Name": "month_c"}},
          {"field": {"Name": "year_c"}}
        ],
        where: [
          {"FieldName": "category_c", "Operator": "EqualTo", "Values": [category]},
          {"FieldName": "month_c", "Operator": "EqualTo", "Values": [month]},
          {"FieldName": "year_c", "Operator": "EqualTo", "Values": [year]}
        ]
      };
      
      const existingResponse = await apperClient.fetchRecords('budget_c', params);
      
      if (existingResponse.success && existingResponse.data && existingResponse.data.length > 0) {
        // Update existing
        const existing = existingResponse.data[0];
        return await this.update(existing.Id, {
          ...existing,
          monthly_limit_c: parseFloat(monthlyLimit)
        });
      } else {
        // Create new
        return await this.create({
          Name: category,
          category_c: category,
          monthly_limit_c: parseFloat(monthlyLimit),
          month_c: month,
          year_c: parseInt(year)
        });
      }
    } catch (error) {
      console.error("Error upserting budget:", error?.response?.data?.message || error);
      return null;
    }
  }
};