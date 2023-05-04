int lm35_pin = A4, leitura_lm35 = 0;
float temperatura;


void setup() 
{
Serial.begin(9600);
pinMode(lm35_pin, INPUT);
pinMode(ldr_pin, INPUT);
}
 
void loop() 
{
  leitura_lm35 = analogRead(lm35_pin);
  temperatura = leitura_lm35 * (5.0/1023) * 100;

  Serial.print(temperatura);
//Espera  2 segundos para rodar o código denovo
 delay(2000);
}
