import axiosInstance from "./axiosConfig";

export const streamsAPI = {
  // Get all streams
  getAllStreams: async () => {
    try {
      const response = await axiosInstance.get("/streams");
      return response.data;
    } catch (error) {
      console.error("Error fetching all streams:", error);
      throw error;
    }
  },

  // Get stream by ID
  getStreamById: async (streamId) => {
    try {
      const response = await axiosInstance.get(`/streams/${streamId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching stream:", error);
      throw error;
    }
  },

  // Create a new stream
  createStream: async (streamData) => {
    try {
      const response = await axiosInstance.post("/streams", streamData);
      return response.data;
    } catch (error) {
      console.error("Error creating stream:", error);
      throw error;
    }
  },

  // Update stream
  updateStream: async (streamId, streamData) => {
    try {
      const response = await axiosInstance.put(
        `/streams/${streamId}`,
        streamData,
      );
      return response.data;
    } catch (error) {
      console.error("Error updating stream:", error);
      throw error;
    }
  },
};
