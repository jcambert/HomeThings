using HomeThings.Server.Commands;
using Microsoft.Owin.Cors;
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
#if JARVIS
using Webcorp.Domotic.Core;
#endif

namespace HomeThings.Server
{
    class Program
    {
        private static bool Halt { get; set; }


        static void Main(string[] args)
        {
            var baseAddress = "http://*:80/";
            var isWin = Environment.OSVersion.Platform == PlatformID.Win32NT;
            //if (isWin) baseAddress = "http://192.168.0.11:8888/";
            if (isWin) baseAddress = "http://127.0.0.1:8888/";
            var httpHost = WebApp.Start<Startup>(url: baseAddress);

            var urlOfThisApp = baseAddress.Replace("*", "127.0.0.1");

            using (var uow = new UnitOfWork())
            {
                if (uow.SettingRepository.Count() == 0)
                {
                    Setting setting = new Setting() { AutomaticRefreshTime = 5000, ManualRefreshMode = true };
                    uow.SettingRepository.Insert(setting);
                    uow.Save();
                }
                uow.CommandRepository.DeleteAll();
                uow.Save();
                if (uow.CommandRepository.Count() == 0)
                {
                    Command cde0 = new Command() { Name = "Command 1", Description = "Allumer la led Temoins", Action = "allumer", Pin = 13, DigitalValue = true, Destination = "COM6", PortOrRate = 9600, Measurement = Measurement.Digital, Method = Method.Serial, Way = Way.Output };
                    Command cde1 = new Command() { Name = "Command 2", Description = "Eteindre la led Temoins", Action = "eteindre", Pin = 13, DigitalValue = false, Destination = "COM6", PortOrRate = 9600, Measurement = Measurement.Digital, Method = Method.Serial, Way = Way.Output };
                    Command cde2 = new Command() { Name = "Command 3", Description = "Fermer port com", Action = "fermer port com", Method = Method.Internal };
                    Command cde3 = new Command() { Name = "Command 4", Description = "Ouvrir port com", Action = "ouvrir port com", Method = Method.Internal };
                    Command cde4 = new Command() { Name = "Command 4", Description = "Ouvrir Application", Action = "ouvrir application", Method = Method.Internal, OkResponse = "{0} ouvert", ErrorResponse = "{0} non ouvert" };
                    Command cde5 = new Command() { Name = "Command 5", Description = "Avoir des email", Action = "est-ce que j'ai des messages", Method = Method.Internal, OkResponse = "{0} ouvert", ErrorResponse = "{0} non ouvert" };

                    uow.CommandRepository.Insert(cde0);
                    uow.CommandRepository.Insert(cde1);
                    uow.CommandRepository.Insert(cde2);
                    uow.CommandRepository.Insert(cde3);
                    uow.CommandRepository.Insert(cde4);
                    uow.CommandRepository.Insert(cde5);
                    uow.Save();
                }
            }

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
                        Process.Start(urlOfThisApp + PageHandler.PAGE_INDEX);
                        break;
                    case "Q":
                        Console.WriteLine("Stopping...");

                        Halt = true;


                        httpHost.Dispose();

                        Console.WriteLine("Stopped.");
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
#if JARVIS
        private JarvisSerial jserial;
#endif
        public void Configuration(IAppBuilder appBuilder)
        {
            //appBuilder.Use<InterceptResponseMiddleware>(appBuilder);
            //appBuilder.Use<PageHandlerMiddleware>(appBuilder);

            ConfigureSignalR(appBuilder);

            ConfigureWebApi(appBuilder);

            ConfigureFileServer(appBuilder);
#if JARVIS
            ConfigureJarvis();
#endif
        }
#if JARVIS
        private void ConfigureJarvis()
        {

            var sub = Jarvis._.Command.Subscribe(onCommand);
            jserial = new JarvisSerial("COM6", 9600);

            jserial.ReceiveidString.Subscribe(onReceivedString);
            jserial.Start();



        }

        public void onCommand(string text)
        {
            //if (text == "quitter") System.Environment.Exit(-1);
            jserial.Write(text);

        }

        public void onReceivedString(string text)
        {
            Console.WriteLine(text);
        }
#endif
        private void ConfigureSignalR(IAppBuilder appBuilder)
        {
            appBuilder.UseCors(CorsOptions.AllowAll);
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
                routeTemplate: "api/{controller}/{action}/{id}",
                defaults: new { id = RouteParameter.Optional });
            httpConfiguration.Routes.MapHttpRoute(
              name: "ApiByAction",
              routeTemplate: "api/controller/{action}"
            );
            appBuilder.UseWebApi(httpConfiguration);


        }

        private void ConfigureFileServer(IAppBuilder app)
        {
            var options = new FileServerOptions
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
