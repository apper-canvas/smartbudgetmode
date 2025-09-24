const { ApperClient } = window.ApperSDK;

export const savingsGoalService = {
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
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "target_amount_c"}},
          {"field": {"Name": "current_amount_c"}},
          {"field": {"Name": "deadline_c"}},
          {"field": {"Name": "created_at_c"}}
        ],
        orderBy: [{"fieldName": "deadline_c", "sorttype": "ASC"}]
      };
      
      const response = await apperClient.fetchRecords('savings_goal_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching savings goals:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = this.getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "target_amount_c"}},
          {"field": {"Name": "current_amount_c"}},
          {"field": {"Name": "deadline_c"}},
          {"field": {"Name": "created_at_c"}}
        ]
      };
      
      const response = await apperClient.getRecordById('savings_goal_c', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching savings goal ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async create(goalData) {
    try {
      const apperClient = this.getApperClient();
      const params = {
        records: [{
          Name: goalData.title_c || goalData.Name || '',
          title_c: goalData.title_c,
          target_amount_c: parseFloat(goalData.target_amount_c),
          current_amount_c: parseFloat(goalData.current_amount_c || 0),
          deadline_c: goalData.deadline_c,
          created_at_c: new Date().toISOString()
        }]
      };
      
      const response = await apperClient.createRecord('savings_goal_c', params);
      
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
      console.error("Error creating savings goal:", error?.response?.data?.message || error);
      return null;
    }
  },

  async update(id, goalData) {
    try {
      const apperClient = this.getApperClient();
      const params = {
        records: [{
          Id: parseInt(id),
          Name: goalData.title_c || goalData.Name || '',
          title_c: goalData.title_c,
          target_amount_c: parseFloat(goalData.target_amount_c),
          current_amount_c: parseFloat(goalData.current_amount_c),
          deadline_c: goalData.deadline_c
        }]
      };
      
      const response = await apperClient.updateRecord('savings_goal_c', params);
      
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
      console.error("Error updating savings goal:", error?.response?.data?.message || error);
      return null;
    }
  },

  async delete(id) {
    try {
      const apperClient = this.getApperClient();
      const params = { 
        RecordIds: [parseInt(id)]
      };
      
      const response = await apperClient.deleteRecord('savings_goal_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return false;
      }
      
      if (response.results && response.results.length > 0) {
        return response.results.filter(r => r.success).length > 0;
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting savings goal:", error?.response?.data?.message || error);
      return false;
    }
  },

  async updateAmount(id, amount) {
    try {
      const goal = await this.getById(id);
      if (!goal) return null;
      
      const newAmount = Math.max(0, (goal.current_amount_c || 0) + amount);
      
      return await this.update(id, {
        ...goal,
        current_amount_c: newAmount
      });
    } catch (error) {
      console.error("Error updating savings goal amount:", error?.response?.data?.message || error);
      return null;
    }
  }
};