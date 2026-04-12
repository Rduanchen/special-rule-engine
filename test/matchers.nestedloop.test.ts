import { describe, expect, it } from "vitest";
import { nestedLoopMatcher } from "../src/engine/matchers";

describe("nested loop matcher", () => {
    describe("C-liked", () => {
        describe("braces omitted", () => {
            it("unmatched", () => {
                const results = [nestedLoopMatcher.match({}, {
                    language: "C",
                    text:
                        `
                        #include<stdio.h>
                        int main(){
                            int n,counter=0;
                            scanf("%d", &n);
                            for(int i=0;i<n;i++)
                                counter++;
                            for(int j=0;j<n;j++)
                                counter++;  
                            printf("%d", counter);
                            return 0;
                        }
                        `,
                }),
                ];
                results.forEach((result) => {
                    expect(result.matched).toBe(false);
                });
            })
            it("for for", () => {
                const result = nestedLoopMatcher.match({}, {
                    language: "C",
                    text:
                        `
                        #include<stdio.h>
                        int main(){
                            int n,counter=0;
                            scanf("%d", &n);
                            for(int i=0;i<n;i++)
                                for(int j=0;j<n;j++)
                                    counter++;  
                            printf("%d", counter);
                            return 0;
                        }
                        `,
                });
                expect(result.matched).toBe(true);
            })
            it("for while", () => {
                const result = nestedLoopMatcher.match({}, {
                    language: "C",
                    text:
                        `
                        #include<stdio.h>
                        int main(){
                            int n,counter=0;
                            scanf("%d", &n);
                            for(int i=0;i<n;i++)
                                while(counter<10)
                                    counter++;
                            printf("%d", counter);
                            return 0;
                        }
                        `,
                });
                expect(result.matched).toBe(true);
            })
            it("while for", () => {
                const result = nestedLoopMatcher.match({}, {
                    language: "C",
                    text:
                        `
                        #include<stdio.h>
                        int main(){
                            int n,counter=0;
                            scanf("%d", &n);
                            while(counter<10)
                                for(int j=0;j<n;j++)
                                    counter++;
                            printf("%d", counter);
                            return 0;
                        }
                        `,
                });
                expect(result.matched).toBe(true);
            })
            it("while while", () => {
                const result = nestedLoopMatcher.match({}, {
                    language: "C",
                    text:
                        `
                        #include<stdio.h>
                        int main(){
                            int n,counter=0;
                            scanf("%d", &n);
                            while(counter<10)
                                while(counter<10)
                                    counter++;
                            printf("%d", counter);
                            return 0;
                        }
                        `,
                });
                expect(result.matched).toBe(true);
            })
        })
        describe("with braces", () => {
            it("for for", () => {
                const result = nestedLoopMatcher.match({}, {
                    language: "C",
                    text:
                        `
                        #include<stdio.h>
                        int main(){
                            int n,counter=0;
                            scanf("%d", &n);
                            for(int i=0;i<n;i++){
                                if(12==0){
                                    printf("\}");
                                    return 0;
                                }
                                for(int j=0;j<n;j++)
                                    counter++;  
                            }
                            printf("%d", counter);
                            return 0;
                        }
                        `,
                });
                expect(result.matched).toBe(true);
            })
            it("for while", () => {
                const result = nestedLoopMatcher.match({}, {
                    language: "C",
                    text:
                        `
                        #include<stdio.h>
                        int main(){
                            int n,counter=0;
                            scanf("%d", &n);
                            for(int i=0;i<n;i++){
                                if(12==0){
                                    printf("\}");
                                    return 0;
                                }
                                while(counter<10)
                                    counter++;  
                            }
                            printf("%d", counter);
                            return 0;
                        }
                        `,
                });
                expect(result.matched).toBe(true);
            })
            it("while for", () => {
                const result = nestedLoopMatcher.match({}, {
                    language: "C",
                    text:
                        `
                        #include<stdio.h>
                        int main(){
                            int n,counter=0;
                            scanf("%d", &n);
                            while(counter<10){
                               if(12==0){
                                        printf("\}");
                                        return 0;
                                    }
                                for(int j=0;j<n;j++)
                                    counter++;
                            }
                            printf("%d", counter);
                            return 0;
                        }
                        `,
                });
                expect(result.matched).toBe(true);
            })
            it("while while", () => {
                const result = nestedLoopMatcher.match({}, {
                    language: "C",
                    text:
                        `
                        #include<stdio.h>
                        int main(){
                            int n,counter=0;
                            scanf("%d", &n);
                            while(counter<10){
                                if(12==0){
                                    printf("\}");
                                    return 0;
                                }
                                while(counter<10){
                                    counter++;
                                }
                            }
                            printf("%d", counter);
                            return 0;
                        }
                        `,
                });
                expect(result.matched).toBe(true);
            })
        })
    })

    describe("edge cases", () => {
        it("do/while nested", () => {
            const result = nestedLoopMatcher.match({}, {
                language: "C",
                text:
                    `
                    #include<stdio.h>
                    int main(){
                        int n,c=0;
                        scanf("%d",&n);
                        do {
                            for(int i=0;i<n;i++)
                                c++;
                        } while(0);
                        return 0;
                    }
                    `,
            });
            expect(result.matched).toBe(true);
        })
        it("do/while not nested", () => {
            const result = nestedLoopMatcher.match({}, {
                language: "C",
                text:
                    `
                    #include<stdio.h>
                    int main(){
                        int n,c=0;
                        scanf("%d",&n);
                        do
                            c++;
                        while(c<1);
                        for(int i=0;i<n;i++)
                            c++;
                        return 0;
                    }
                    `,
            });
            expect(result.matched).toBe(false);
        })
        it("triple nesting", () => {
            const result = nestedLoopMatcher.match({}, {
                language: "C",
                text:
                    `
                    #include<stdio.h>
                    int main(){
                        int n,c=0;
                        scanf("%d",&n);
                        for(int i=0;i<n;i++){
                            for(int j=0;j<n;j++){
                                while(c<10){
                                    c++;
                                }
                            }
                        }
                        return 0;
                    }
                    `,
            });
            expect(result.matched).toBe(true);
        })
        it("loops in strings and comments should not match", () => {
            const result = nestedLoopMatcher.match({}, {
                language: "C",
                text:
                    `
                    #include<stdio.h>
                    int main(){
                        // for(int i=0;i<n;i++) for(int j=0;j<n;j++) {}
                        printf("for(int i=0;i<n;i++) for(int j=0;j<n;j++)");
                        int x=0;
                        for(int i=0;i<1;i++) x++;
                        return 0;
                    }
                    `,
            });
            expect(result.matched).toBe(false);
        })
        it("empty for statement then for should not be nested", () => {
            const result = nestedLoopMatcher.match({}, {
                language: "C",
                text:
                    `
                    #include<stdio.h>
                    int main(){
                        int n,x=0;
                        scanf("%d",&n);
                        for(int i=0;i<n;i++);
                        for(int j=0;j<n;j++) { x++; }
                        return 0;
                    }
                    `,
            });
            expect(result.matched).toBe(false);
        })
        it("identifier false positive", () => {
            const result = nestedLoopMatcher.match({}, {
                language: "C",
                text:
                    `
                    #include<stdio.h>
                    int main(){
                        int format = 0;
                        while(format<2) format++;
                        return 0;
                    }
                    `,
            });
            expect(result.matched).toBe(false);
        })
        it("C++ range-for nested", () => {
            const result = nestedLoopMatcher.match({}, {
                language: "C++",
                text:
                    `
                    #include <vector>
                    using namespace std;
                    int main(){
                        vector<int> a,b;
                        for(auto &x : a)
                            for(auto &y : b)
                                (void)x;
                        return 0;
                    }
                    `,
            });
            expect(result.matched).toBe(true);
        })
    })

})