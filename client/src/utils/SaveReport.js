import axios from "axios";

export const saveReportToDatabase = async (backendUrl, reportData) => {
  try {
    const { data } = await axios.post(
      `${backendUrl}/api/report/save-report`,
      reportData,
      { withCredentials: true }
    );

    return data;
  } catch (error) {
    console.error("Error saving report:", error);
    return null;
  }
};
