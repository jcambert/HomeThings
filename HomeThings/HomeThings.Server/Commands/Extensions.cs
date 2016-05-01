using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using Webcorp.Domotic.Core;

namespace HomeThings.Server.Commands
{
    public static class Commands
    {
        private static Dictionary<string, JarvisSerial> serials;

        static Commands()
        {
            serials = new Dictionary<string, JarvisSerial>();
        }
        public static bool Execute(this ICommand cmd, params string[] parameters)
        {
            bool result = false;
            switch (cmd.Method)
            {
                case Method.Http:
                    break;
                case Method.Serial:
                    result=cmd.ExecuteSerial();
                    break;
                case Method.Internal:
                    result =cmd.ExecuteInternal(parameters);
                    break;
                default:
                    break;
            }

            return result;
        }

        private static bool ExecuteSerial(this ICommand cmd)
        {
            JarvisSerial serial;
            if (!cmd.SerialFromCommand(out serial)) return false;

            if (cmd.Way == Way.Output && cmd.Measurement == Measurement.Digital)
                if (cmd.Pin.IsNotNull())
                    serial.Write(string.Format("{0}*{1}", cmd.Pin, cmd.DigitalValue ? 1 : 0));
            return true;
        }

        private static bool ExecuteInternal(this ICommand cmd, params string[] parameters)
        {
            var cde = Commands.GetInternalCommand(cmd.Action);
            if (cde.IsNull()) throw new ApplicationException("La commande interne n'est pas parametrée");
            return cde.Execute(cmd, parameters) ;
        }
        private static bool SerialFromCommand(this ICommand cmd, out JarvisSerial serial)
        {
            
            var destination = cmd.Destination;
            serial = null;
            if (destination.IsNullOrEmpty())
            {
                Console.Error.WriteLine("Serial destination is not set");
                return false;
            }
            if (!serials.ContainsKey(destination))
            {
                var port = cmd.PortOrRate;
                serial = new JarvisSerial(destination, port);
                serial.ReceiveidString.Subscribe(s =>
                {
                    Console.WriteLine(s);
                });
                serials[destination] = serial;
            }
            else
                serial = serials[destination];
            if (!serial.Serial.IsOpen)
                serial.Start();
            return true;

        }

        public static void CloseSerial(string portName)
        {
            serials.Values.Where(s => s.Serial.PortName == portName).FirstOrDefault()?.Stop();

        }

        public static void OpenSerial(string portName)
        {
            serials.Values.Where(s => s.Serial.PortName == portName).FirstOrDefault()?.Start();

        }

        static Dictionary<string, InternalCommand> _internalCommands;
        public static Dictionary<string, InternalCommand> InternalCommands
        {
            get
            {
                if (_internalCommands.IsNull())
                {
                    _internalCommands = new Dictionary<string, InternalCommand>();
                    var types = Assembly.GetAssembly(typeof(InternalCommand)).GetTypes().Where(t => t.IsSubclassOf(typeof(InternalCommand)));
                    foreach (var type in types)
                    {
                        var attr = type.GetCustomAttribute<InternalCommandAttribute>();
                        if (attr.IsNull()) continue;
                        _internalCommands[attr.Name] = Activator.CreateInstance(type) as InternalCommand;
                    }
                }
                return _internalCommands;
            }
        }

        public static InternalCommand GetInternalCommand(string name)
        {
            var ic = InternalCommands;
            return ic.ContainsKey(name) ? ic[name] : null;
        }
    }
}
