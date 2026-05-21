import axios from "axios";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


// Helper function to get authorization headers
const getAuthHeaders = () => {
  const accessToken = localStorage.getItem("userToken");
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
};

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login/`, {
      email,
      password,
    });

    const result = response.data; // axios auto-parses JSON

    if (!result.success) {
      throw new Error(result.message || "Login failed");
    }

    const token = result.data?.token;
    const id = result.data?.id
    console.log("Token:", token);

    if (!token) {
      throw new Error("Token missing in response");
    }

    localStorage.setItem("userToken", token);
    localStorage.setItem("userId", id);
    return result;

  } catch (error) {
    console.error("Error during login API call:", error);

    // Handle backend error message properly
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error("Network error or server not responding");
    }
  }
};



export const SignupUser = async (username, email, password, first_name, last_name) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/signup/`, {
      username,
      email,
      password,
      first_name,
      last_name,
    });

    return response.data;
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Server not responding");
  }
};




export const getToken = () => {
  return localStorage.getItem('userToken');
};

export const logoutUser = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem("userId");
};


export const getUserById = async (id) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/user/${id}/`,
      {
        headers: getAuthHeaders(),
      }
    );

    const result = response.data;

    if (!result.success) {
      throw new Error(result.message);
    }

    return result.data;

  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch user");
  }
};

export const currentUserId = () => {
  return localStorage.getItem("userId"); 
};


export const updateUser = async (userData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/user/update/`,
      userData,
      {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      }
    );

    const result = response.data;

    if (!result.success) {
      throw new Error(result.message || "Update failed");
    }

    return result;

  } catch (error) {
    console.error("Update API error:", error);

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw new Error("Server not responding");
  }
};