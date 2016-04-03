using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HomeThings.Server.Controllers
{
    public class SettingsController : ApiControllerWithHub<Setting, HomeThingsHub>
    {
        public override IRepository<Setting> Repository => UnitOfWork.SettingRepository;
        
    }
}
