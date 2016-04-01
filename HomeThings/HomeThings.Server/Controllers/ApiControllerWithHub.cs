using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;

namespace HomeThings.Server.Controllers
{
    public abstract class ApiControllerWithHub<THub> : ApiController
        where THub : IHub
    {
       
        Lazy<IHubContext> hub = new Lazy<IHubContext>(
            () => GlobalHost.ConnectionManager.GetHubContext<THub>()
        );

        Lazy<IUnitOfWork> uow = new Lazy<IUnitOfWork>(
            () => new UnitOfWork()
        );

        protected IHubContext Hub=> hub.Value;

        protected IUnitOfWork UnitOfWork => uow.Value;

       
    }
}
