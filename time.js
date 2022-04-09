var weekDays = ['Sun', 'Moon', 'Tiu', 'Woden', 'Thor', 'Frey', 'Saturn'];
var ordinalChime = ['First', 'Second', 'Third', 'Last'];

var ordinalList = ['ERROR', 
					'First', 'Second', 'Third', 'Fourth', 'Fifth',
					'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth',
					'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth',
					'Sixteenth', 'Seventeenth', 'Eighteenth', 'Nineteenth'];

var numberNameList = ['ERROR', 
					'One', 'Two', 'Three', 'Four', 'Five',
					'Six', 'Seven', 'Eight', 'Nine'];

var ordinalListTens = ['ERROR', 
					'ERROR', 'Twentieth', 'Thirtieth', 'Fortieth', 'Fiftieth',
					'Sixtieth', 'Seventieth', 'Eightieth', 'Nintieth'];

var numberListTens = ['ERROR', 
					'ERROR', 'Twenty', 'Thirty', 'Forty', 'Fifty',
					'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function ordinalTrue (intInput)
{
	let outputString = "";
	let units		= intInput % 10;
	intInput = Math.floor(intInput / 10);
	
	let tens		= intInput % 10;
	intInput = Math.floor(intInput / 10);
	
	let hundreds	= intInput % 10;
	intInput = Math.floor(intInput / 10);
	
	let thousands	= intInput;
	
	if (hundreds > 1)
	{
		outputString += numberNameList[hundreds] + " Hundred";
		
		if ((tens == 0) && (units == 0))
			outputString += "th";
		else 
			outputString += " and ";
	}
	
	if (tens > 1)
	{
		if (units == 0)
			outputString += ordinalListTens[tens];
		else 
			outputString += numberListTens[tens] + "-";
	}
	
	if (tens == 1)
	{
		outputString += ordinalList[units + 10];
	}
	else if (units > 0)
	{
		outputString += ordinalList[units];
	}
	
	return outputString;
}

var marrachTime = 
{
	tick : -1, 
	chime : "Error", 
	hour : -1, 
	bell : "Error", 
	day : -1, 
	weekday : "Error", 
	moon : -1, 
	yra : -1,
	
	offset : -1,
	
	updateTime : function() 
	{
		let timeNow = new Date();
		
		if (this.offset == -1)
		{
			switch (timeNow.getUTCMonth())
			{
				case 11://	December
				case 0:	//	January
				case 1: //	February
					this.offset = 5;
					break;
				
				case 3: //	April
				case 4: //	May
				case 5: //	June
				case 6: //	July
				case 7: //	August
				case 8: //	September
				case 9: //	October
					this.offset = 4;
					break;
				
				case 2: //	March
					if ((timeNow.getUTCDate() - timeNow.getUTCDay() > 7) && (timeNow.getUTCHours() > 7))
						//	after the second sunday
						this.offset = 4;
					else
						//	before the second sunday in march
						this.offset = 5;
					break;
				
				case 10: //	November
					if ((timeNow.getUTCDate() - timeNow.getUTCDay() > 0) && (timeNow.getUTCHours() > 6))
						//	after the first sunday
						this.offset = 5;
					else
						//	before the first sunday
						this.offset = 4;
					break;
			}
		}
		
		timeNow.setTime( timeNow.getTime() - this.offset*60*60*1000 );
		
		this.tick = timeNow.getUTCMinutes();
		this.hour = timeNow.getUTCHours();
		
		if (this.hour == 0)
			this.bell = "Midnight";
		else if (this.hour < 12)
			this.bell = ordinalTrue(this.hour) + " Early";
		else if (this.hour == 12)
			this.bell = "Midday";
		else
			this.bell = ordinalTrue(this.hour - 12) + " Late";
		
		this.day = timeNow.getUTCDate();
		this.moon = timeNow.getUTCMonth() + 1;
		this.yra = timeNow.getUTCFullYear() -1999;
		
		this.weekday = weekDays[timeNow.getUTCDay()] + "\'s Day";
		
		let chimeNumber = Math.floor(timeNow.getUTCMinutes() / 15);
		
		this.chime = ordinalChime[chimeNumber];
		
//		console.log("It is the " + this.chime + " Chime of the " + this.bell + " Bell on " + this.weekday + " the "
//			+ ordinalTrue(this.day) + " of the " + ordinalTrue(this.moon) + " Moon in the " + ordinalTrue(this.yra) 
//			+ " Year of Recent Awakenings")
	}
}

marrachTime.updateTime();