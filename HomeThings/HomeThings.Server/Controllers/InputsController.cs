using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HomeThings.Server.Controllers
{
    public class InputsController : ApiControllerWithHub<Input, HomeThingsHub>
    {
        public override IRepository<Input> Repository => UnitOfWork.InputRepository;
    }
}
