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
          .replace(/(&quot\;)/g, '"')
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">");
      }
    }
    return cleanedItem;
  });

  return cleanedData;
};

function formatDate(dateString) {
  /*
  const date = new Date(dateString); // 주어진 문자열을 Date 객체로 파싱

  const year = date.getFullYear(); // 연도 가져오기 (YYYY 형식)
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 월 가져오기 (MM 형식, 0부터 시작하므로 1을 더하고 2자리로 만듦)
  const day = String(date.getDate()).padStart(2, "0"); // 일 가져오기 (DD 형식)

  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const dayOfWeek = days[date.getDay()]; // 요일 가져오기

  const hours = String(date.getHours()).padStart(2, "0"); // 시 가져오기 (HH 형식)
  const minutes = String(date.getMinutes()).padStart(2, "0"); // 분 가져오기 (MM 형식)
  const seconds = String(date.getSeconds()).padStart(2, "0"); // 초 가져오기 (SS 형식)

  const formattedDate = `${year}-${month}-${day}, ${dayOfWeek}, ${hours}:${minutes}:${seconds}`;
  return formattedDate;
  */
  const date = new Date(dateString);
  const formattedDate = `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}, ${
    ["일", "월", "화", "수", "목", "금", "토"][date.getDay()]
  }, ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
  return formattedDate;
}

export default function Home() {
  const ID_KEY = process.env.NEXT_PUBLIC_API_KEY;
  const SECRET_KEY = process.env.NEXT_PUBLIC_API_SECRET_KEY;

  const [allData, setAllData] = useState([]);
  const [data, setData] = useState([]);
  const [searchData, setSerchData] = useState("");
  const [isSearched, setIsSearched] = useState(false);
  const [visiblePosts, setVisiblePosts] = useState(10);

  // useEffect(() => {});

  const fetchData = async () => {
    try {
      const response = await axios.get("/v1/search/news.json", {
        params: {
          query: searchData,
          sort: "sim",
          display: 100,
        },
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "X-Naver-Client-Id": ID_KEY,
          "X-Naver-Client-Secret": SECRET_KEY,
        },
      });

      const cleanedData = removeTags(response.data);
      setAllData(cleanedData);
      return cleanedData.slice(0, 10);
    } catch (error) {
      console.error(`Error fetching data: ${error}`);
      return [];
    }
  };

  const onClick = async () => {
    setIsSearched(true);
    const newData = await fetchData();
    setData(newData);
  };

  const onKeyDown = (e) => {
    if (e.keyCode == 13) onClick();
  };

  const loadMorePosts = () => {
    const newVisiblePosts = visiblePosts + 10;
    setData(allData.slice(0, newVisiblePosts));
    setVisiblePosts(newVisiblePosts);
  };

  return (
    <div className="site-wrap flex flex-col min-h-screen">
      <header className="top-bar navbar shadow-md fixed inset-x-0 bg-white">
        <a href="/" className="logo btn btn-ghost text-xl">
          코딩 어려웠썬?
        </a>
        <div className="flex gap-x-3 ml-auto">
          <input
            className="input input-bordered"
            type="text"
            placeholder="뉴스 검색"
            value={searchData}
            onChange={(e) => setSerchData(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <button className="btn btn-primary" onClick={onClick}>
            검색
          </button>
        </div>
      </header>
      <div className="h-[80px]"></div>

      <section className="section-wrap flex-grow mb-[20px]">
        <div className="container mx-auto h-full">
          <nav className="news-box">
            <ul
              className={`${
                isSearched ? "border-t-2 border-x-2" : "border-none"
              }`}
            >
              {data.map((item, index) => (
                <li key={index} className="border-b-2 flex flex-col p-3">
                  <a
                    href={item.originallink}
                    target="_blank"
                    className="news-tit font-bold hover:underline my-3"
                  >
                    {item.title}
                  </a>
                  <a
                    href={item.link}
                    target="_blank"
                    className="news-content hover:underline"
                  >
                    <span>{item.description}</span>
                  </a>
                  <div className="flex justify-end mr-2 mt-2">
                    <span className="badge badge-secondary badge-outline">
                      {formatDate(item.pubDate)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            {visiblePosts < allData.length && (
              <button
                className="border-2 h-[50px] w-full flex items-center justify-center mt-[10px] btn btn-accent"
                onClick={loadMorePosts}
              >
                <span>게시물 더 보기</span>
              </button>
            )}
          </nav>
        </div>
      </section>
      <footer className="footer items-center p-4 bg-neutral text-neutral-content">
        <aside className="items-center grid-flow-col">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fillRule="evenodd"
            clipRule="evenodd"
            className="fill-current"
          >
            <path d="M22.672 15.226l-2.432.811.841 2.515c.33 1.019-.209 2.127-1.23 2.456-1.15.325-2.148-.321-2.463-1.226l-.84-2.518-5.013 1.677.84 2.517c.391 1.203-.434 2.542-1.831 2.542-.88 0-1.601-.564-1.86-1.314l-.842-2.516-2.431.809c-1.135.328-2.145-.317-2.463-1.229-.329-1.018.211-2.127 1.231-2.456l2.432-.809-1.621-4.823-2.432.808c-1.355.384-2.558-.59-2.558-1.839 0-.817.509-1.582 1.327-1.846l2.433-.809-.842-2.515c-.33-1.02.211-2.129 1.232-2.458 1.02-.329 2.13.209 2.461 1.229l.842 2.515 5.011-1.677-.839-2.517c-.403-1.238.484-2.553 1.843-2.553.819 0 1.585.509 1.85 1.326l.841 2.517 2.431-.81c1.02-.33 2.131.211 2.461 1.229.332 1.018-.21 2.126-1.23 2.456l-2.433.809 1.622 4.823 2.433-.809c1.242-.401 2.557.484 2.557 1.838 0 .819-.51 1.583-1.328 1.847m-8.992-6.428l-5.01 1.675 1.619 4.828 5.011-1.674-1.62-4.829z"></path>
          </svg>
          <p>Copyright © 2024 - All right reserved</p>
        </aside>
        <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end text-xl">
          방구석 코딩
        </nav>
      </footer>
    </div>
  );
}
