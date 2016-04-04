using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace HomeThings.Server
{
    [HubName("HomeThings")]
    public class HomeThingsHub : Hub
    {
        class ThingState
        {
            public int Id { get; set; }
            public State State { get; set; }
            public Mode Mode { get; set; }
            public List<OutputState> Outputs{get;set;}

        }

        class OutputState
        {
            public int Id { get; set; }
            public string Value { get; set; }
        }

        Lazy<IUnitOfWork> uow = new Lazy<IUnitOfWork>(
            () => new UnitOfWork()
        );
        protected IUnitOfWork UnitOfWork => uow.Value;

        public void UpdateStatus()
        {
            var result = new List<ThingState>();

            var things = UnitOfWork.ThingRepository.Get().ToList();
            foreach (var thing in things)
            {
                var request= (HttpWebRequest)WebRequest.Create(string.Format("http://{0}:{1}/state", thing.Ip, thing.Port > 0 ? thing.Port.ToString() : "80"));
                request.Method = WebRequestMethods.Http.Get;
                request.Accept = "application/json";
                // var request = WebRequest.Create("http://192.168.0.11:7070/state");
                request.Timeout = 5000;
                try
                {
                    Console.WriteLine(request.RequestUri);
                    using (WebResponse response = request.GetResponse())
                    {
                        Stream dataStream = response.GetResponseStream();
                        StreamReader reader = new StreamReader(dataStream);
                        
                        string s = reader.ReadToEnd();
                        var outObject = JsonConvert.DeserializeObject<ThingState>(s);
                        outObject.Id = thing.Id;
                        result.Add(outObject);

                        Console.Write(": response:" + s);
                    }
                }catch(WebException ex)
                {
                    result.Add(new ThingState() { Id = thing.Id, State = State.Offline ,Mode=Mode.Unknown});
                    Console.Write(":" + ex.Message);
                }
                
                

            }

            Clients.All.UpdateStatusResult(result);
        }

    }
}
