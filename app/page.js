"use client";
import axios from "axios";
import { useState } from "react";

export default function Home() {
  const ID_KEY = process.env.NEXT_PUBLIC_API_KEY;
  const SECRET_KEY = process.env.NEXT_PUBLIC_API_SECRET_KEY;

  const [data, setData] = useState(null);
  const onClick = async () => {
    try {
      const response = await axios.get("/v1/search/news.json", {
        params: {
          query: "날씨",
          display: 20,
        },
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "X-Naver-Client-Id": ID_KEY,
          "X-Naver-Client-Secret": SECRET_KEY,
        },
      });
      // resp.json(response.data.items);
      setData(response.data);
      // console.log(response);
    } catch (e) {
      console.error(`e : ${e}`);
      // resp.status(500).send("Internal Server Error");
    }
  };

  return (
    <div>
      <button onClick={onClick}>불러오기</button>
      {data && (
        <textarea
          rows={7}
          value={JSON.stringify(data, null, 2)}
          readOnly={true}
        />
      )}
    </div>
  );
}