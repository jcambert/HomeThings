using System;
using System.Threading.Tasks;
using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(HomeThings.Startup))]

namespace HomeThings
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            // Pour plus d'informations sur la façon de configurer votre application, consultez http://go.microsoft.com/fwlink/?LinkID=316888
            app.MapSignalR();
        }
    }
}
