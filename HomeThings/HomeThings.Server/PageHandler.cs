using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HomeThings.Server
{
    public static class PageHandler
    {
        private static Dictionary<int, string> _pageHandler=new Dictionary<int, string>();
        public const string PAGE_INDEX = "index.html";

        public const int CODE_FORBIDDEN = 403;
        public const int CODE_NOT_FOUND = 404;

        public const string PAGE_FORBIDDEN = "403.html";
        public const string PAGE_NOT_FOUND = "404.html";
        static PageHandler()
        {
            MapPageHandler();
        }

        private static void MapPageHandler()
        {
            _pageHandler[CODE_FORBIDDEN] = PAGE_FORBIDDEN;
            _pageHandler[CODE_NOT_FOUND] = PAGE_NOT_FOUND;
        }

        public static bool TryHandle(int statusCode,out string page)
        {
            if (!_pageHandler.ContainsKey(statusCode))
            {
                page = string.Empty;
                return false;
            }
            page = _pageHandler[statusCode];
            return true;
        }
    }
}
