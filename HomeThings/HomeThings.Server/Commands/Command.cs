using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HomeThings.Server.Commands
{

    public interface ICommand
    {
        string Name { get; set; }
        string Description { get; set; }
        string Destination { get; set; }
        int PortOrRate { get; set; }
        Method Method { get; set; }
        Way Way { get; set; }
        Measurement Measurement { get; set; }
        bool DigitalValue { get; set; }
        double AnalogValue { get; set; }
        string Action { get; set; }
        int Pin { get; set; }
        string OkResponse { get; set; }
        string ErrorResponse { get; set; }
        
    }

    public enum Method
    {
        Http,
        Serial,
        Internal
    }

    public enum Way
    {
        Input,
        Output
    }

    public enum Measurement
    {
        Analog,
        Digital
    }

    public  class Command :Entity, ICommand
    {
        public string Name
        {
            get;

            set;
        }

        public string Description
        {
            get;

            set;
        }

        public string Destination
        {
            get;

            set;
        }

        public int PortOrRate
        {
            get;

            set;
        }

        public Measurement Measurement
        {
            get;

            set;
        }

        public Method Method
        {
            get;

            set;
        }

        public Way Way
        {
            get;

            set;
        }

        public bool DigitalValue
        {
            get;
            set;
        }

        public double AnalogValue
        {
            get;

            set;
        }
        public string Action { get;  set; }

        public int Pin
        {
            get;

            set;
        }

        public string OkResponse
        {
            get;

            set;
        }

        public string ErrorResponse
        {
            get;

            set;
        }
    }
}
