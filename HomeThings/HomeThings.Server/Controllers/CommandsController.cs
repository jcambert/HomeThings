using HomeThings.Server.Commands;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
#if JARVIS
using Webcorp.Domotic.Core;
#endif
using System.Net.Http;
using System.Threading;

namespace HomeThings.Server.Controllers
{

    public class CommandsController : ApiControllerWithHub<Command, HomeThingsHub>
    {
        public override IRepository<Command> Repository => UnitOfWork.CommandRepository;

        [ResponseType(typeof(string))]
        public IHttpActionResult Put(int id, string command)
        {

            return Ok("ok");
        }

       /* public IHttpActionResult GetCommand(string command)
        {
            Jarvis._.SendCommand(command.Replace('é', 'e').Replace('è', 'e'));
            return Ok(command);
        }*/

        public IHttpActionResult GetExecuteCommand(string command)
        {
            command = command.Replace('é', 'e');
            var cmd = Repository.Get(c =>  command.Trim().ToLower().StartsWith(c.Action)).FirstOrDefault();
           
            if (cmd == null)
                return NotFound();
            var parameters = command.Substring(cmd.Action.Length).Trim().Split(' ');
            try {
                if (cmd.Execute(parameters))
                {
                    return Ok(string.Format(cmd.OkResponse ?? string.Empty, parameters));
                }
                else {
                    return BadRequest(cmd.ErrorResponse, parameters);
                }
            }catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        
        protected new internal virtual IHttpActionResult NotFound()
        {
            return new NotFoundResult();
        }

        protected  internal virtual IHttpActionResult BadRequest(string error,params string[] parametres)
        {
            return new BadRequestResult(string.Format(error,parametres));
        }
    }

    internal class NotFoundResult : IHttpActionResult
    {
        public Task<HttpResponseMessage> ExecuteAsync(CancellationToken cancellationToken)
        {
            var response = new HttpResponseMessage()
            {
                Content = new StringContent("Commande inconnue"),
                StatusCode = System.Net.HttpStatusCode.NotImplemented
            };
            return Task.FromResult(response);
        }
    }

    internal class BadRequestResult : IHttpActionResult
    {
        readonly string _error;
        public BadRequestResult(string error)
        {
            this._error = error ?? string.Empty;
        }
        public Task<HttpResponseMessage> ExecuteAsync(CancellationToken cancellationToken)
        {
            var response = new HttpResponseMessage()
            {
                Content = new StringContent(_error),
                StatusCode = System.Net.HttpStatusCode.BadRequest
            };
            return Task.FromResult(response);
        }
    }
}
