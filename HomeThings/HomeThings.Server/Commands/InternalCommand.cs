using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HomeThings.Server.Commands
{

    public class InternalCommandAttribute :Attribute
    {
        private readonly string _name;
        public InternalCommandAttribute(string name)
        {
            this._name = name;
        }

        public string Name => _name;
    }



    public abstract class InternalCommand
    {
       
        public abstract bool Execute(ICommand cmd,params string[] parameters );
    }

    public interface IReceiver
    {
        bool Execute();
    }


    [InternalCommand("fermer port com")]
    public class FermerPortComCommand : InternalCommand
    {
        
        public override bool Execute(ICommand cmd, params string[] parameters)
        {
            Commands.CloseSerial(string.Format("COM{0}", parameters[0]));
            return true;
        }
    }

    [InternalCommand("ouvrir port com")]
    public class OuvrirPortComCommand : InternalCommand
    {

        public override bool Execute(ICommand cmd, params string[] parameters)
        {
            Commands.OpenSerial(string.Format("COM{0}", parameters[0]));
            return true;
        }
    }

    [InternalCommand("ouvrir application")]
    public class OuvrirApplication : InternalCommand
    {
        public override bool Execute(ICommand cmd, params string[] parameters)
        {
            try {
                Process.Start(parameters[0]);
                return Process.GetProcessesByName(parameters[0]).Length>0;
                //return true;
            }
            catch (Exception)
            {
                return false;
            }
           
        }
    }

  /*  [InternalCommand("est-ce que j'ai des messages")]
    public class GotMessages : InternalCommand
    {
        public override bool Execute(ICommand cmd, params string[] parameters)
        {
            try
            {
                var mailClient = Microsoft.Win32.Registry.GetValue(@"HKEY_LOCAL_MACHINE\SOFTWARE\Clients\Mail", "", "none").ToString();
                if (mailClient == "Microsoft Outlook")
                {
                    var pname = "outlook";
                    if (Process.GetProcessesByName(pname).Length >0)
                        application = Marshal.GetActiveObject("Outlook.Application") as Outlook.Application;
                    return ;
                }
                return true;
            }
            catch (Exception)
            {
                return false;
            }

        }
    }*/
}
