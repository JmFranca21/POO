import { Bicicleta } from "./bicicleta"

export class Estacao {
    bicicletas: Set<Bicicleta> = new Set()

    constructor(
        public readonly id: string,
        public capacidade: number,
        public sobrecarga = false
    ) {}

    temEspaco() {
        return this.bicicletas.size < this.capacidade
    } 

    atracar(bicicleta: Bicicleta) {
        if(!this.temEspaco()) {
            throw 'Sem espaço para atracar'
        }

        if(bicicleta.status === 'EmUso') {
        throw Error('Não é possível atracar bicicleta em uso')
        }

        if(bicicleta.estacao && bicicleta.estacao !== this) {
        bicicleta.estacao.desatracar(bicicleta)
        }

        this.bicicletas.add(bicicleta)
        bicicleta.atrelarA(this)
    }

    desatracar(bicicleta: Bicicleta) {
        if (!this.bicicletas.has(bicicleta)) {
            throw Error('Bicicleta não está nesta estação')
        }

        this.bicicletas.delete(bicicleta)
        bicicleta.desatrelar()
    }

    quantidadeDeBicicletas() {
        return this.bicicletas.size
    }
}