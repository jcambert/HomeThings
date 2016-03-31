using Microsoft.Owin.Hosting;
using Microsoft.Owin.StaticFiles;
using Microsoft.Owin.StaticFiles.ContentTypes;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Owin;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net.Http.Formatting;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;

namespace HomeThings.Server
{
    class Program
    {
        private static bool Halt { get; set; }

        static void Main(string[] args)
        {
            var baseAddress = "http://*:80/";
            var isWin = Environment.OSVersion.Platform == PlatformID.Win32NT;
            if (isWin) baseAddress = "http://localhost:8081/";
            var httpHost = WebApp.Start<Startup>(url: baseAddress);

            var urlOfThisApp = baseAddress.Replace("*", "127.0.0.1");

            
            for (;;)
            {
                Console.WriteLine();
                Console.WriteLine("URL: " + urlOfThisApp);
                Console.WriteLine("[O]pen browser / [Q]uit");
                var key = Console.ReadKey(intercept: true).KeyChar.ToString().ToUpper();
                Console.WriteLine(key);
                Console.WriteLine();
                switch (key)
                {
                    case "O":
                        Process.Start(urlOfThisApp+PageHandler.PAGE_INDEX);
                        break;
                    case "Q":
                        Console.WriteLine("Stoping...");

                        Halt = true;


                        httpHost.Dispose();

                        Console.WriteLine("Stoped.");
                        return;
                    default:
                        break;
                }
                Console.Clear();

            }
        }

    }

    internal class Startup
    {
        public void Configuration(IAppBuilder appBuilder)
        {
            //appBuilder.Use<InterceptResponseMiddleware>(appBuilder);
            appBuilder.Use<PageHandlerMiddleware>(appBuilder);

            ConfigureSignalR(appBuilder);

            ConfigureWebApi(appBuilder);

            ConfigureFileServer(appBuilder);
        }

        private void ConfigureSignalR(IAppBuilder appBuilder)
        {
            appBuilder.MapSignalR();
        }

        private void ConfigureWebApi(IAppBuilder appBuilder)
        {
            var httpConfiguration = new HttpConfiguration();

            httpConfiguration.Formatters.Clear();
            httpConfiguration.Formatters.Add(new JsonMediaTypeFormatter());

            httpConfiguration.Formatters.JsonFormatter.SerializerSettings =
                new JsonSerializerSettings
                {
                    ContractResolver = new CamelCasePropertyNamesContractResolver()
                };

            httpConfiguration.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional });

            appBuilder.UseWebApi(httpConfiguration);


        }

        private void ConfigureFileServer(IAppBuilder app)
        {
            var options=new FileServerOptions
            {
#if DEBUG
                EnableDirectoryBrowsing = true,
#else
                EnableDirectoryBrowsing = false,
#endif
                
                FileSystem = new EmbeddedResourceFileSystem("HomeThings.Server"),
                
            };
            options.StaticFileOptions.ContentTypeProvider = new ContentTypeProvider();

            app.UseFileServer(options);
        }
    }
}
