import React, { useEffect, useState } from "react";

const FetchPullsData = ({ setTodaysPulls, setWeeksPulls }) => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();
        const midnightToday = new Date(today.setUTCHours(0, 0, 0, 0))
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
        const midnightWeekAgo = new Date(today.setDate(today.getDate() - 7))
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");

        console.log("Midnight today:", midnightToday);

        const fetchTodaysPulls = fetch("/api/checkout_afterTime", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ timestamp: midnightToday }),
        });

        const fetchWeeksPulls = fetch("/api/checkout_afterTime", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ timestamp: midnightWeekAgo }),
        });

        const [todaysResponse, weeksResponse] = await Promise.all([
          fetchTodaysPulls,
          fetchWeeksPulls,
        ]);

        if (!todaysResponse.ok || !weeksResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const todaysData = await todaysResponse.json();
        const weeksData = await weeksResponse.json();

        setTodaysPulls(todaysData.length);
        setWeeksPulls(weeksData.length);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [setTodaysPulls, setWeeksPulls]);

  return null;
};

export default FetchPullsData;
