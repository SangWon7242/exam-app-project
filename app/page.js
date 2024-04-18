"use client";
import axios from "axios";
import * as React from "react";

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
  const date = new Date(dateString);
  const formattedDate = `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}, ${
    ["일", "월", "화", "수", "목", "금", "토"][date.getDay()]
  }, ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
  return formattedDate;
}

export default function Home() {
  const ID_KEY = process.env.NEXT_PUBLIC_API_KEY;
  const SECRET_KEY = process.env.NEXT_PUBLIC_API_SECRET_KEY;

  // 뉴스 담당 변수
  const [allData, setAllData] = React.useState([]);
  const [data, setData] = React.useState([]);
  const [searchData, setSerchData] = React.useState("");
  const [isSearched, setIsSearched] = React.useState(false);
  const [visiblePosts, setVisiblePosts] = React.useState(10);

  // 날씨 데이터
  const API_KEY = process.env.NEXT_PUBLIC_API_WEATHER_KEY;
  const [weatherData, setWeatherData] = React.useState([]);
  const [regions, setRegions] = React.useState([
    { id: 1, region: "서울특별시", nx: 60, ny: 127 },
    { id: 2, region: "부산광역시", nx: 98, ny: 76 },
    { id: 3, region: "대구광역시", nx: 89, ny: 90 },
    { id: 4, region: "인천광역시", nx: 55, ny: 124 },
    { id: 5, region: "광주광역시", nx: 58, ny: 74 },
    { id: 6, region: "대전광역시", nx: 67, ny: 100 },
    { id: 7, region: "울산광역시", nx: 102, ny: 84 },
    { id: 8, region: "세종특별자치시", nx: 66, ny: 103 },
    { id: 9, region: "경기도", nx: 60, ny: 120 },
  ]);

  const [selectedRegion, setSelectedRegion] = React.useState(null);

  const weatherFetchData = async (nx, ny) => {
    try {
      const response = await fetch(
        `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${API_KEY}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=20240418&base_time=0600&nx=${nx}&ny=${ny}`
      );
      const json = await response.json();
      console.log(json);
      setWeatherData(json);
    } catch (error) {
      console.error(`Error fetching data: ${error}`);
      return [];
    }
  };

  const handleSelectChange = (event) => {
    const selectedId = parseInt(event.target.value, 10);
    const foundRegion = regions.find((region) => region.id === selectedId);
    setSelectedRegion(foundRegion);

    // API 호출을 여기서 직접 트리거하거나, 필요한 상위 컴포넌트에 정보를 전달
    weatherFetchData(foundRegion.nx, foundRegion.ny);
  };

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
    if (searchData.length == 0) return;

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

      <section className="weather-section-wrap">
        <div className="container mx-auto h-full">
          <div className="search-box">
            <select
              className="select select-primary w-full max-w-xs"
              onChange={handleSelectChange}
              value={selectedRegion?.id || ""}
            >
              <option disabled selected>
                지역을 선택하세요.
              </option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.region}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

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
