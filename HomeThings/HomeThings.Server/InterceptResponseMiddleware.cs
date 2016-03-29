using Microsoft.Owin;
using Owin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HomeThings.Server
{
    
    internal class InterceptResponseMiddleware : OwinMiddleware
    {
        public InterceptResponseMiddleware(OwinMiddleware next, IAppBuilder app) : base(next)
        {

        }

        public override async Task Invoke(IOwinContext context)
        {
            var response = context.Response;
            var request = context.Request;

            response.OnSendingHeaders(state =>
            {
                var resp = (OwinResponse)state;
                resp.Headers.Add("X-MyResponse-Header",new string[] { "Some Value" });
                resp.StatusCode = PageHandler.CODE_FORBIDDEN;
                resp.ReasonPhrase = "Forbidden";
            }, response);

            var header = request.Headers["X-Whatever-Header"];

            await Next.Invoke(context);

        }
    }
}
