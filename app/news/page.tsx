import React from 'react';

const TheVergeLayout = () => {
  return (
    <div className="bg-black text-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
        <div className="text-2xl font-bold">The Verge</div>
        <button className="bg-red-600 px-4 py-2 rounded text-sm">START YOUR FREE TRIAL</button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row p-6 gap-6">
        {/* Left Section */}
        <div className="lg:w-3/5 flex flex-col gap-6">
          {/* First Section */}
          <div className="flex items-center justify-center p-4 border-b lg:border-b-0 lg:border-r border-gray-800">
            <div className="text-center">
              <div className="bg-teal-500 w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center">
                {/* Add image or logo here */}
                <div className="text-xl font-bold">AI</div>
              </div>
              <h1 className="text-4xl font-bold mb-2">Stop using generative AI as a search engine</h1>
              <p className="text-gray-400">
                A fake presidential pardon explains why you can’t trust robots with the news.
              </p>
              <div className="text-sm mt-4 text-gray-400">Elizabeth Lopatto - Dec 5</div>
            </div>
          </div>

          {/* Today's Storystream */}
          <div className="p-6 bg-gray-900 rounded-lg">
            <div className="mb-4">
              <h2 className="text-green-500 text-sm uppercase">Today’s Storystream</h2>
              <p className="text-gray-400 text-xs">Feed refreshed 44 minutes ago</p>
              <p className="text-sm text-gray-400">Crisis. Survival. Advancement.</p>
            </div>

            <ul className="space-y-4">
              <li className="flex justify-between items-center border-b border-gray-800 pb-4">
                <div>
                  <p className="uppercase text-xs text-gray-500">Microsoft</p>
                  <h3 className="text-lg font-bold">
                    Microsoft ends Surface Studio 2 Plus production with no successor in sight
                  </h3>
                  <p className="text-xs text-gray-500">Tom Warren - 44 minutes ago</p>
                </div>
              </li>
              <li className="flex justify-between items-center border-b border-gray-800 pb-4">
                <div>
                  <p className="uppercase text-xs text-gray-500">Uber</p>
                  <h3 className="text-lg font-bold">
                    Uber’s first international robotaxi service is live in the UAE
                  </h3>
                  <p className="text-xs text-gray-500">Andrew J. Hawkins - Two hours ago</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Featured Story */}
          <div>
            <img
              src="https://images.pexels.com/photos/12695405/pexels-photo-12695405.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              alt="Featured Story"
              className="rounded-lg mb-4"
            />
            <h2 className="text-2xl font-bold mb-2">
              Amazon’s Secret Level is a hollow anthology of video game cutscenes
            </h2>
            <p className="text-gray-400 mb-2">
              The new animated series from the creators of Love, Death & Robots manages to be both
              confusing and dull.
            </p>
            <p className="text-xs text-gray-500">Andrew Webster - Dec 5</p>
          </div>
        </div>

        {/* Right Section: Most Popular */}
        <div className="lg:w-2/5 relative">
          <div className="sticky top-0">
            <h2 className="text-2xl font-bold bg-purple-900 px-4 py-2 rounded-t-lg">Most Popular</h2>
            <ul className="bg-purple-800 p-4 space-y-4 rounded-b-lg">
              {[
                {
                  title: "Verizon is once again raising its fees",
                  author: "Allison Johnson",
                  date: "Dec 4",
                  comments: 24,
                },
                {
                  title:
                    "OpenAI is charging $200 a month for an exclusive version of its ‘reasoning’ model",
                  author: "Kyle Robison",
                  date: "Dec 5",
                  comments: 54,
                },
                {
                  title: "Amazon’s Secret Level is a hollow anthology of video game cutscenes",
                  author: "Andrew Webster",
                  date: "Dec 5",
                  comments: 17,
                },
                {
                  title: "Stop using generative AI as a search engine",
                  author: "Elizabeth Lopatto",
                  date: "Dec 5",
                  comments: 45,
                },
                {
                  title:
                    "Sundar Pichai says Google Search will ‘change profoundly’ in 2025",
                  author: "Emma Roth",
                  date: "Dec 5",
                  comments: 22,
                },
              ].map((item, index) => (
                <li key={index} className="flex">
                  <div className="text-gray-400 mr-4">{index + 1}</div>
                  <div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="text-sm text-gray-500">
                      {item.author} - {item.date} | {item.comments} comments
                    </p>
                  </div>
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
