export function AddBreak(speech: string, second: number = 1) : string
{
	return speech += "<break time=\"" + second + "s\"/>";
}