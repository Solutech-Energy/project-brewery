// não altere!
const serialport = require('serialport');
const express = require('express');
const mysql = require('mysql2');
const sql = require('mssql');

// não altere!
const SERIAL_BAUD_RATE = 9600;
const SERVIDOR_PORTA = 3300;

// configure a linha abaixo caso queira que os dados capturados sejam inseridos no banco de dados.
// false -> nao insere
// true -> insere
const HABILITAR_OPERACAO_INSERIR = true;

// altere o valor da variável AMBIENTE para o valor desejado:
// API conectada ao banco de dados remoto, SQL Server -> 'producao'
// API conectada ao banco de dados local, MySQL Workbench - 'desenvolvimento'
const AMBIENTE = 'desenvolvimento';

const serial = async (
    valoresDht11Umidade,
    valoresDht11Temperatura,
    valoresLuminosidade,
    valoresLm35Temperatura,
    valoresChave
) => {
    let poolBancoDados = ''

    if (AMBIENTE == 'desenvolvimento') {
        poolBancoDados = mysql.createPool(
            {
                // altere!
                // CREDENCIAIS DO BANCO LOCAL - MYSQL WORKBENCH
                host: 'localhost',
                user: 'root',
                password: 'Deus2004@',
                database: 'cervejaria'
            }
        ).promise();
    } else if (AMBIENTE == 'producao') {
        console.log('Projeto rodando inserindo dados em nuvem. Configure as credenciais abaixo.');
    } else {
        throw new Error('Ambiente não configurado. Verifique o arquivo "main.js" e tente novamente.');
    }


    const portas = await serialport.SerialPort.list();
    const portaArduino = portas.find((porta) => porta.vendorId == 2341 && porta.productId == 43);
    if (!portaArduino) {
        throw new Error('O arduino não foi encontrado em nenhuma porta serial');
    }
    const arduino = new serialport.SerialPort(
        {
            path: portaArduino.path,
            baudRate: SERIAL_BAUD_RATE
        }
    );
    arduino.on('open', () => {
        console.log(`A leitura do arduino foi iniciada na porta ${portaArduino.path} utilizando Baud Rate de ${SERIAL_BAUD_RATE}`);
    });
    arduino.pipe(new serialport.ReadlineParser({ delimiter: '\r\n' })).on('data', async (data) => {
        //console.log(data);
        const valores = data.split(';');
        const dht11Umidade = parseFloat(valores[0]);
        const dht11Temperatura = parseFloat(valores[1]);
        const lm35Temperatura = parseFloat(valores[2]);
        const luminosidade = parseFloat(valores[3]);
        const chave = parseInt(valores[4]);

        valoresDht11Umidade.push(dht11Umidade);
        valoresDht11Temperatura.push(dht11Temperatura);
        valoresLuminosidade.push(luminosidade);
        valoresLm35Temperatura.push(lm35Temperatura);
        valoresChave.push(chave);

        if (HABILITAR_OPERACAO_INSERIR) {
            if (AMBIENTE == 'producao') {
                // altere!
                // Este insert irá inserir os dados na tabela "medida"
                // -> altere nome da tabela e colunas se necessário
                // Este insert irá inserir dados de fk_aquario id=1 (fixo no comando do insert abaixo)
                // >> Importante! você deve ter o aquario de id 1 cadastrado.
                sqlquery = `INSERT INTO medida (dht11_umidade, dht11_temperatura, luminosidade, lm35_temperatura, chave, momento, fk_aquario) VALUES (${dht11Umidade}, ${dht11Temperatura}, ${luminosidade}, ${lm35Temperatura}, ${chave}, CURRENT_TIMESTAMP, 1)`;
                
                // CREDENCIAIS DO BANCO REMOTO - SQL SERVER
                // Importante! você deve ter criado o usuário abaixo com os comandos presentes no arquivo
                // "script-criacao-usuario-sqlserver.sql", presente neste diretório.
                const connStr = "Server=servidor-acquatec.database.windows.net;Database=bd-acquatec;User Id=usuarioParaAPIArduino_datawriter;Password=#Gf_senhaParaAPI;";
                
                function inserirComando(conn, sqlquery) {
                    conn.query(sqlquery);
                    console.log("valores inseridos no banco: ", dht11Umidade + ", " + dht11Temperatura + ", " + luminosidade + ", " + lm35Temperatura + ", " + chave)
                }
                
                sql.connect(connStr)
                .then(conn => inserirComando(conn, sqlquery))
                .catch(err => console.log("erro! " + err));
                
            } else if (AMBIENTE == 'desenvolvimento') {
                
                // console.log("Entrou no else");
                // altere!
                // Este insert irá inserir os dados na tabela "medida"
                // -> altere nome da tabela e colunas se necessário
                // Este insert irá inserir dados de fk_aquario id=1 (fixo no comando do insert abaixo)
                // >> você deve ter o aquario de id 1 cadastrado.
                await poolBancoDados.execute(
                    'INSERT INTO tb_captacao (idCaptacao, TempCaptada, DataHora, fkProcessos) VALUES (null, ?, now(), 1), (null, ?, now(), 2), (null, ?, now(), 3), (null, ?, now(), 4), (null, ?, now(), 5), (null, ?, now(), 6), (null, ?, now(), 7), (null, ?, now(), 8), (null, ?, now(), 9), (null, ?, now(), 10), (null, ?, now(), 11), (null, ?, now(), 12), (null, ?, now(), 13), (null, ?, now(), 14), (null, ?, now(), 15)',
                    [lm35Temperatura,lm35Temperatura,lm35Temperatura,lm35Temperatura,lm35Temperatura,lm35Temperatura,lm35Temperatura,lm35Temperatura,lm35Temperatura,lm35Temperatura,lm35Temperatura,lm35Temperatura,lm35Temperatura,lm35Temperatura,lm35Temperatura]
                );
                
            } else {
                throw new Error('Ambiente não configurado. Verifique o arquivo "main.js" e tente novamente.');
            }
        }
    });
    arduino.on('error', (mensagem) => {
        // console.error(`Erro no arduino (Mensagem: ${mensagem}`)
    });
}


// não altere!
const servidor = (
    valoresLm35Temperatura,
    valoresChave
) => {
    const app = express();
    app.use((request, response, next) => {
        response.header('Access-Control-Allow-Origin', '*');
        response.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
        next();
    });
}

(async () => {
    const valoresDht11Umidade = [];
    const valoresDht11Temperatura = [];
    const valoresLuminosidade = [];
    const valoresLm35Temperatura = [];
    const valoresChave = [];
    await serial(
        valoresDht11Umidade,
        valoresDht11Temperatura,
        valoresLuminosidade,
        valoresLm35Temperatura,
        valoresChave
    );
    servidor(

        valoresLm35Temperatura,
        valoresChave
    );
})();
