import React from 'react';
import Todays from "@/components/news/Todays";

const TheVergeLayout = () => {
  return (
      <div className="text-white max-w-full min-h-screen p-6">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {/* Left Section */}
          <div className="space-y-6">
            {/* Featured Section */}
            <div className="p-6 bg-gray-800 rounded-lg shadow-md">
              <div className="text-center">
                <div
                    className="bg-teal-500 w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center shadow-lg">
                  <div className="text-xl font-bold">AI</div>
                </div>
                <h1 className="text-3xl font-bold mb-2 hover:text-teal-300 transition duration-300">
                  Stop using generative AI as a search engine
                </h1>
                <p className="text-gray-400 text-lg mb-4">
                  A fake presidential pardon explains why you can&#39;t trust robots with the news.
                </p>
                <p className="text-sm text-gray-500">Elizabeth Lopatto - Dec 5</p>
              </div>
            </div>

            {/* Today's Storystream */}
            <Todays/>

            {/* Additional Story */}
            <div>
              <img
                  src="https://4kwallpapers.com/images/walls/thumbs_3t/19423.jpg"
                  alt="Featured Story"
                  className="rounded-lg mb-4 shadow-md"
              />
              <h2 className="text-2xl font-bold mb-2 hover:text-teal-300 transition duration-300">
                Amazon&#39;s Secret Level is a hollow anthology of video game cutscenes
              </h2>
              <p className="text-gray-400 text-lg mb-2">
                The new animated series from the creators of Love, Death & Robots manages to be both
                confusing and dull.
              </p>
              <p className="text-sm text-gray-500">Andrew Webster - Dec 5</p>
            </div>
          </div>

          {/* Right Section */}
          <div>
            <div className="bg-indigo-700 p-6 rounded-lg shadow-md sticky top-6">
              <h2 className="text-2xl font-bold mb-4">Anime</h2>
              <ul className="space-y-4">
                {[
                  {
                    title: "Valve's master plan for Steam Machines is finally coming into focus",
                    author: 'SEAN HOLLISTER',
                    date: 'DEC 6',
                    comments: 64,
                  },
                  {
                    title: "Google's AI weather prediction model is pretty darn good",
                    author: 'JUSTINE CALMA',
                    date: 'DEC 7',
                    comments: 8,
                  },
                  {
                    title: "X's Grok AI chatbot is now available to all users",
                    author: 'EMMA ROTH',
                    date: 'DEC 6',
                    comments: 17,
                  },
                  {
                    title: "Google Wallet's new passport ID feature won't help you enter the country",
                    author: 'JAY PETERS',
                    date: 'DEC 6',
                    comments: 17,
                  },
                  {
                    title: 'AGI is coming and nobody cares',
                    author: 'DAVID PIERCE',
                    date: 'DEC 6',
                    comments: 28,
                  },
                ].map((item, index) => (
                    <li key={index} className="hover:bg-indigo-800 p-4 rounded transition duration-200">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="text-sm text-gray-400">
                        {item.author} - {item.date} | {item.comments} comments
                      </p>
                    </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pt-10">
          {/* Left Section */}
          <div className="space-y-6">
            {/* Featured Section */}
            <div className="p-6 bg-gray-800 rounded-lg shadow-md">
              <div className="text-center">
                <div
                    className="bg-teal-500 w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center shadow-lg">
                  <div className="text-xl font-bold">AI</div>
                </div>
                <h1 className="text-3xl font-bold mb-2 hover:text-teal-300 transition duration-300">
                  Stop using generative AI as a search engine
                </h1>
                <p className="text-gray-400 text-lg mb-4">
                  A fake presidential pardon explains why you can&#39;t trust robots with the news.
                </p>
                <p className="text-sm text-gray-500">Elizabeth Lopatto - Dec 5</p>
              </div>
            </div>

            {/* Today's Storystream */}
            <Todays/>

            {/* Additional Story */}
            <div>
              <img
                  src="https://4kwallpapers.com/images/walls/thumbs_3t/8958.jpg"
                  alt="Featured Story"
                  className="rounded-lg mb-4 shadow-md"
              />
              <h2 className="text-2xl font-bold mb-2 hover:text-teal-300 transition duration-300">
                Amazon&#39;s Secret Level is a hollow anthology of video game cutscenes
              </h2>
              <p className="text-gray-400 text-lg mb-2">
                The new animated series from the creators of Love, Death & Robots manages to be both
                confusing and dull.
              </p>
              <p className="text-sm text-gray-500">Andrew Webster - Dec 5</p>
            </div>
          </div>

          {/* Right Section */}
          <div>
            <div className="bg-red-600 p-6 rounded-lg shadow-md sticky top-6">
              <h2 className="text-2xl text-black font-bold mb-4">Manga</h2>
              <ul className="space-y-4">
                {[
                  {
                    title: "Valve's master plan for Steam Machines is finally coming into focus",
                    author: 'SEAN HOLLISTER',
                    date: 'DEC 6',
                    comments: 64,
                  },
                  {
                    title: "Google's AI weather prediction model is pretty darn good",
                    author: 'JUSTINE CALMA',
                    date: 'DEC 7',
                    comments: 8,
                  },
                  {
                    title: "X's Grok AI chatbot is now available to all users",
                    author: 'EMMA ROTH',
                    date: 'DEC 6',
                    comments: 17,
                  },
                  {
                    title: "Google Wallet's new passport ID feature won't help you enter the country",
                    author: 'JAY PETERS',
                    date: 'DEC 6',
                    comments: 17,
                  },
                  {
                    title: 'AGI is coming and nobody cares',
                    author: 'DAVID PIERCE',
                    date: 'DEC 6',
                    comments: 28,
                  },
                ].map((item, index) => (
                    <li key={index} className="hover:bg-red-700 p-4 rounded transition duration-200">
                      <h3 className="text-lg text-black font-semibold">{item.title}</h3>
                      <p className="text-sm text-black">
                        {item.author} - {item.date} | {item.comments} comments
                      </p>
                    </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pt-10">
          {/* Left Section */}
          <div className="space-y-6">
            {/* Featured Section */}
            <div className="p-6 bg-gray-800 rounded-lg shadow-md">
              <div className="text-center">
                <div
                    className="bg-teal-500 w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center shadow-lg">
                  <div className="text-xl font-bold">AI</div>
                </div>
                <h1 className="text-3xl font-bold mb-2 hover:text-teal-300 transition duration-300">
                  Stop using generative AI as a search engine
                </h1>
                <p className="text-gray-400 text-lg mb-4">
                  A fake presidential pardon explains why you can&#39;t trust robots with the news.
                </p>
                <p className="text-sm text-gray-500">Elizabeth Lopatto - Dec 5</p>
              </div>
            </div>

            {/* Today's Storystream */}
            <Todays/>

            {/* Additional Story */}
            <div>
              <img
                  src="https://4kwallpapers.com/images/walls/thumbs_3t/9306.jpg"
                  alt="Featured Story"
                  className="rounded-lg mb-4 shadow-md"
              />
              <h2 className="text-2xl font-bold mb-2 hover:text-teal-300 transition duration-300">
                Amazon&#39;s Secret Level is a hollow anthology of video game cutscenes
              </h2>
              <p className="text-gray-400 text-lg mb-2">
                The new animated series from the creators of Love, Death & Robots manages to be both
                confusing and dull.
              </p>
              <p className="text-sm text-gray-500">Andrew Webster - Dec 5</p>
            </div>
          </div>

          {/* Right Section */}
          <div>
            <div className="bg-[#c3dd1e] p-6 rounded-lg shadow-md sticky top-6">
              <h2 className="text-2xl text-black font-bold mb-4">Movies & TV Shows</h2>
              <ul className="space-y-4">
                {[
                  {
                    title: "Valve's master plan for Steam Machines is finally coming into focus",
                    author: 'SEAN HOLLISTER',
                    date: 'DEC 6',
                    comments: 64,
                  },
                  {
                    title: "Google's AI weather prediction model is pretty darn good",
                    author: 'JUSTINE CALMA',
                    date: 'DEC 7',
                    comments: 8,
                  },
                  {
                    title: "X's Grok AI chatbot is now available to all users",
                    author: 'EMMA ROTH',
                    date: 'DEC 6',
                    comments: 17,
                  },
                  {
                    title: "Google Wallet's new passport ID feature won't help you enter the country",
                    author: 'JAY PETERS',
                    date: 'DEC 6',
                    comments: 17,
                  },
                  {
                    title: 'AGI is coming and nobody cares',
                    author: 'DAVID PIERCE',
                    date: 'DEC 6',
                    comments: 28,
                  },
                ].map((item, index) => (
                    <li key={index} className="hover:bg-purple-700 p-4 rounded transition duration-200">
                      <h3 className="text-lg text-black font-semibold">{item.title}</h3>
                      <p className="text-sm text-black">
                        {item.author} - {item.date} | {item.comments} comments
                      </p>
                    </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pt-10">
          {/* Left Section */}
          <div className="space-y-6">
            {/* Featured Section */}
            <div className="p-6 bg-gray-800 rounded-lg shadow-md">
              <div className="text-center">
                <div
                    className="bg-teal-500 w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center shadow-lg">
                  <div className="text-xl font-bold">AI</div>
                </div>
                <h1 className="text-3xl font-bold mb-2 hover:text-teal-300 transition duration-300">
                  Stop using generative AI as a search engine
                </h1>
                <p className="text-gray-400 text-lg mb-4">
                  A fake presidential pardon explains why you can&#39;t trust robots with the news.
                </p>
                <p className="text-sm text-gray-500">Elizabeth Lopatto - Dec 5</p>
              </div>
            </div>

            {/* Today's Storystream */}
            <Todays/>

            {/* Additional Story */}
            <div>
              <img
                  src="https://4kwallpapers.com/images/walls/thumbs_3t/15877.jpg"
                  alt="Featured Story"
                  className="rounded-lg mb-4 shadow-md"
              />
              <h2 className="text-2xl font-bold mb-2 hover:text-teal-300 transition duration-300">
                Amazon&#39;s Secret Level is a hollow anthology of video game cutscenes
              </h2>
              <p className="text-gray-400 text-lg mb-2">
                The new animated series from the creators of Love, Death & Robots manages to be both
                confusing and dull.
              </p>
              <p className="text-sm text-gray-500">Andrew Webster - Dec 5</p>
            </div>
          </div>

          {/* Right Section */}
          <div>
            <div className="bg-purple-800 p-6 rounded-lg shadow-md sticky top-6">
              <h2 className="text-2xl font-bold mb-4">Games</h2>
              <ul className="space-y-4">
                {[
                  {
                    title: "Valve's master plan for Steam Machines is finally coming into focus",
                    author: 'SEAN HOLLISTER',
                    date: 'DEC 6',
                    comments: 64,
                  },
                  {
                    title: "Google's AI weather prediction model is pretty darn good",
                    author: 'JUSTINE CALMA',
                    date: 'DEC 7',
                    comments: 8,
                  },
                  {
                    title: "X's Grok AI chatbot is now available to all users",
                    author: 'EMMA ROTH',
                    date: 'DEC 6',
                    comments: 17,
                  },
                  {
                    title: "Google Wallet's new passport ID feature won't help you enter the country",
                    author: 'JAY PETERS',
                    date: 'DEC 6',
                    comments: 17,
                  },
                  {
                    title: 'AGI is coming and nobody cares',
                    author: 'DAVID PIERCE',
                    date: 'DEC 6',
                    comments: 28,
                  },
                ].map((item, index) => (
                    <li key={index} className="hover:bg-purple-700 p-4 rounded transition duration-200">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="text-sm text-gray-400">
                        {item.author} - {item.date} | {item.comments} comments
                      </p>
                    </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
  );
};

export default TheVergeLayout;
