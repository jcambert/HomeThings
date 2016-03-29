using Microsoft.Owin;
using Owin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HomeThings.Server
{
    internal class PageHandlerMiddleware : OwinMiddleware
    {
        public PageHandlerMiddleware(OwinMiddleware next, IAppBuilder app) : base(next)
        {

        }
        public override async Task Invoke(IOwinContext context)
        {
            await Next.Invoke(context);
            string page;
            if (PageHandler.TryHandle(context.Response.StatusCode, out page))
                context.Response.Redirect(page);
            
        }
    }
}
