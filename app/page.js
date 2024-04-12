"use client";
import axios from "axios";
import { useState } from "react";

const removeTags = (data) => {
  const cleanedData = data.items.map((item) => {
    // 각 객체의 속성에 특수 문자가 포함되어 있다고 가정하여 제거
    const cleanedItem = {};
    for (const key in item) {
      if (Object.hasOwnProperty.call(item, key)) {
        const value = item[key];
        // 정규 표현식을 사용하여 특수 문자 제거 (예: '<', '>', '&')
        cleanedItem[key] = value
          .replace(/<(\/)?([a-zA-Z]*)(\s[a-zA-Z]*=[^>]*)?(\s)*(\/)?>/gi, "")
          .replace(/(&quot\;)/g, '"');
      }
    }
    return cleanedItem;
  });

  return cleanedData;
};

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
      const respData = removeTags(response.data);
      console.log(respData);
      setData(respData);
    } catch (e) {
      console.error(`e : ${e}`);
    }
  };

  return (
    <div className="site-wrap">
      <header className="top-bar navbar shadow-md fixed inset-x-0 bg-white">
        <a href="/" className="logo btn btn-ghost text-xl">
          방구석코딩 뉴스
        </a>
        <div className="flex gap-x-3 ml-auto">
          <input
            className="input input-bordered"
            type="text"
            placeholder="뉴스 검색"
            value={searchData}
            onChange={(e) => setSerchData(e.target.value)}
          />
          <button className="btn btn-primary" onClick={onClick}>
            검색
          </button>
        </div>
      </header>
      <div className="h-[80px]"></div>
      {JSON.stringify(data, null, 2)}

      <section className="section-wrap min-h-[500px]">
        <div className="container mx-auto">
          <div className="news-box border border-2"></div>
        </div>
        <ul>
          {data.map((item, index) => (
            <li key={index}>
              <a href={item.originallink} target="_blank">
                뉴스제목 : {item.title}
              </a>
              <span>{item.description}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
