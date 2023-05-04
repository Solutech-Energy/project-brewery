create database cervejaria;
use cervejaria;


create table tb_processos (
idProcessos int primary key auto_increment,
NomeProcessos varchar(45),
TempMin decimal,
TempMax decimal
);


create table tb_captacao (
idCaptacao int primary key auto_increment,
TempCaptada decimal,
DataHora datetime,
fkProcessos int,
constraint nomesProcessos foreign key (fkProcessos) references tb_Processos (idProcessos)
);




insert into tb_processos values 
(null,"Maceração", 12, 15),
(null,"Malteaçao Et.1", 48, 50),
(null,"Malteaçao Et.2", 70, 75),
(null,"Malteaçao Et.3", 75, 90),
(null,"Moagem", 62, 72),
(null,"Brassagem Et.1", 35, 40),
(null,"Brassagem Et.2", 55, 70),
(null,"Brassagem Et.3", 62, 67),
(null,"Fervura", 100, 102),
(null,"Resfriamento Et.1", 7, 12),
(null,"Resfriamento Et.2", 12, 17),
(null,"Resfriamento Et.3", 4, 6),
(null,"Maturação", 0, 2),
(null,"Pasteurização", 60, 70),
(null,"Produto Final", 2, 7);

select * from tb_captacao;
select * from tb_processos;

