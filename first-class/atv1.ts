class Student {
    name: string
    grades: number[]

    constructor(name: string, grades: number[]) {
        this.name = name
        this.grades = []
    }

    addGrade(num: number): void {
        this.grades.push(num);
    }

    getAverage(grades: number[]) {
        let i: number = 0
        let average: number = 0
        let sum: number = 0

        for (const num of grades) {
            sum += num
            i++
        }

        average = sum / i

        console.log(`A média de ${this.name} foi ${average}.`)
    }
}

const s1 = new Student("Helena", [])

s1.addGrade(10)
s1.addGrade(7.5)
s1.addGrade(5)

s1.getAverage(s1.grades)

const students: Student[] = [
    new Student("Alice", []),
    new Student("João", [])
];

students[0]?.addGrade(10)
students[0]?.addGrade(9)
students[0]?.addGrade(8)

students[1]?.addGrade(6)
students[1]?.addGrade(7)
students[1]?.addGrade(8)

students[0]?.getAverage(students[0].grades)
students[1]?.getAverage(students[1].grades)
