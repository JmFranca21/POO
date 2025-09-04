#include <stdio.h>
#include <stdlib.h>

typedef struct NameNode
{
    char c;
    struct NameNode *next;
} NameNode;

typedef struct GradeNode
{
    float grade;
    struct GradeNode *next;
} GradeNode;

typedef struct Student
{
    NameNode *name;
    GradeNode *grades;
} Student;

void appendChar(NameNode **head, char c)
{
    NameNode *newNode = (NameNode *)malloc(sizeof(NameNode));
    newNode->c = c;
    newNode->next = NULL;

    if (*head == NULL)
    {
        *head = newNode;
    }
    else
    {
        NameNode *temp = *head;
        while (temp->next != NULL)
            temp = temp->next;
        temp->next = newNode;
    }
}

void appendGrade(GradeNode **head, float g)
{
    GradeNode *newNode = (GradeNode *)malloc(sizeof(GradeNode));
    newNode->grade = g;
    newNode->next = NULL;

    if (*head == NULL)
    {
        *head = newNode;
    }
    else
    {
        GradeNode *temp = *head;
        while (temp->next != NULL)
            temp = temp->next;
        temp->next = newNode;
    }
}

void printStudent(Student s, int index)
{
    printf("Student %d: ", index + 1);
    NameNode *nNode = s.name;
    while (nNode != NULL)
    {
        printf("%c", nNode->c);
        nNode = nNode->next;
    }

    printf("\nGrades: ");
    GradeNode *gNode = s.grades;
    while (gNode != NULL)
    {
        printf("%.1f ", gNode->grade);
        gNode = gNode->next;
    }
    printf("\n\n");
}

float getAverage(GradeNode *grades)
{
    if (grades == NULL)
        return 0.0;

    float sum = 0;
    int count = 0;
    GradeNode *current = grades;

    while (current != NULL)
    {
        sum += current->grade;
        count++;
        current = current->next;
    }

    return (count > 0) ? (sum / count) : 0.0;
}

int main()
{
    int n = 2;
    Student students[n];

    for (int i = 0; i < n; i++)
    {
        students[i].name = NULL;
        students[i].grades = NULL;
    }

    char *name0 = "John";
    for (int i = 0; name0[i] != '\0'; i++)
        appendChar(&students[0].name, name0[i]);
    float grades0[] = {8.5, 9.0, 7.5};
    for (int i = 0; i < 3; i++)
        appendGrade(&students[0].grades, grades0[i]);

    char *name1 = "Alice";
    for (int i = 0; name1[i] != '\0'; i++)
        appendChar(&students[1].name, name1[i]);
    float grades1[] = {9.5, 8.0, 6.5};
    for (int i = 0; i < 3; i++)
        appendGrade(&students[1].grades, grades1[i]);

    for (int i = 0; i < n; i++)
    {
        printStudent(students[i], i);
        float avg = getAverage(students[i].grades);
        printf("Average: %.2f\n\n", avg);
    }

    return 0;
}
