import { Bicicleta } from "./bicicleta"
import { Estacao } from "./estacao"
import { Tarifa } from "./tarifa"
import { Usuario } from "./usuario"
import { Viagem } from "./viagem"

class GerenciadorViagens {
    constructor(
      public usuarios: Map<string, Usuario>,
      public bicicletas: Map<string, Bicicleta>,
      public estacoes: Map<string, Estacao>,
      public viagens: Map<string, Viagem>,
    ) {}
  
    iniciarViagem(
      usuarioId: string,
      bicicleta: Bicicleta,
      origem: Estacao,
      agora: Date = new Date()) {
        const usuario = this.usuarios.get(usuarioId)
        if (!usuario) {
          throw new Error('Usuário não encontrado')
        }
        origem.desatracar(bicicleta)
        bicicleta.iniciarUso()
  
        const viagem = new Viagem(
          `${usuarioId}-${agora}`,
          usuario,
          origem
        )
  
        viagem.iniciar(bicicleta, agora)
        this.viagens.set(viagem.id, viagem)
        return viagem
      }
  
      concluirViagem(
        usuarioId: string,
        destino: Estacao,
        agora: Date = new Date()) {
        const viagem = Array.from(this.viagens.values()).find(
          (v) => v.usuario.id === usuarioId && v.estado === 'Ativa'
        )
        if (!viagem) {
          throw Error('Nenhuma viagem ativa para este usuário')
        }
        if(!destino.temEspaco) {
          throw Error('Sem espaço na estação de destino')
        }
  
        const bicicleta = viagem.bicicleta!
  
        const minutos = viagem.duracaoMinutos(agora)
        const minutosPagos = Math.max(0, minutos - 3)
        const precoPorMin = bicicleta.tipo === 'eletrica' ? 0.35 : 0.25
        const multSobrecarga = destino.sobrecarga ? 1.5 : 1.0
        const total = dinheiro(minutosPagos * precoPorMin * multSobrecarga)
  
        const tarifa = new Tarifa(minutos, total)
        bicicleta.finalizarUsoEm(destino)
        viagem.concluir(agora, tarifa, destino)
  
        console.log('Minutos', minutos, 'Cobrança: R$' + total.toFixed(2))
      }
  }

  function dinheiro(n: number) {
    return Math.round(n * 100) / 100
  }

  function main() {
    const usuarios = new Map<string, Usuario>()
    const bicicletas = new Map<string, Bicicleta>()
    const estacoes = new Map<string, Estacao>()
    const viagens = new Map<string, Viagem>()

    const u1 = new Usuario('U1', 'Ana')
    usuarios.set(u1.id, u1)

    const bComum = new Bicicleta('B1', 'comum')
    const bEletrica = new Bicicleta('E1', 'eletrica')
    bicicletas.set(bComum.id, bComum)
    bicicletas.set(bEletrica.id, bEletrica)

    const sOrigem = new Estacao('S1', 2, false)
    const sDestino = new Estacao('S2', 3, true)
    estacoes.set(sOrigem.id, sOrigem)
    estacoes.set(sDestino.id, sDestino)

    sOrigem.atracar(bComum)
    sOrigem.atracar(bEletrica)

    const ger = new GerenciadorViagens(usuarios, bicicletas, estacoes, viagens)

    const inicio = new Date('2025-09-10T10:00:00Z')
    const fim = new Date('2025-09-10T10:25:10Z')

    console.log('Bicicletas em S1:', sOrigem.quantidadeDeBicicletas())
    console.log('Iniciando viagem')
    const v = ger.iniciarViagem(u1.id, bEletrica, sOrigem, inicio)
    console.log('Estado da viagem:', v.estado)
    console.log('Bicicletas em S1:', sOrigem.quantidadeDeBicicletas())

    ger.concluirViagem(u1.id, sDestino, fim)
    console.log(v)

    sDestino.desatracar(bEletrica)
    sOrigem.atracar(bEletrica)

    console.log(sOrigem.quantidadeDeBicicletas())
    const bExtra = new Bicicleta('B2', 'comum')

    try {
        sOrigem.atracar(bExtra)
    } finally {
        console.log("Sempre executa!")
    }

    console.log("Cheguei aqui!")
  }

  main()

  