import { useState, useEffect } from "react";
import { streamsAPI } from "../services/streamsAPI";

export const useStreams = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await streamsAPI.getAllStreams();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to fetch streams");
        console.error("useStreams error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

export const useStreamById = (streamId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!streamId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await streamsAPI.getStreamById(streamId);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to fetch stream");
        console.error("useStreamById error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [streamId]);

  return { data, loading, error };
};
