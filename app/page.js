"use client";
import axios from "axios";
import { useState } from "react";

export default function Home() {
  const ID_KEY = process.env.NEXT_PUBLIC_API_KEY;
  const SECRET_KEY = process.env.NEXT_PUBLIC_API_SECRET_KEY;

  const [data, setData] = useState([]);
  const [searchData, setSerchData] = useState("");

  const onClick = async () => {
    try {
      const response = await axios.get("/v1/search/news.json", {
        params: {
          query: searchData,
          display: 20,
        },
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "X-Naver-Client-Id": ID_KEY,
          "X-Naver-Client-Secret": SECRET_KEY,
        },
      });
      setData(response.data);
    } catch (e) {
      console.error(`e : ${e}`);
    }
  };

  return (
    <div>
      <div className="flex gap-x-3">
        <input
          className="input input-bordered"
          type="text"
          placeholder="날씨를 검색해주세요."
          value={searchData}
          onChange={(e) => setSerchData(e.target.value)}
        />
        <button className="btn btn-primary" onClick={onClick}>
          검색
        </button>
      </div>
      {JSON.stringify(data, null, 2)}

      <nav className="news-list-box">
        <ul>
          {Array.isArray(data.items) &&
            data.items.map((item) => (
              <li>
                <a href="{item.originallink}">뉴스제목 : {item.title}</a>
              </li>
            ))}
        </ul>
      </nav>
    </div>
  );
}
