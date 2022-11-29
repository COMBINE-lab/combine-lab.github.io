---
title: 'Why use Rust for bioinformatics? Part 1: Defining the problem space.'
author: Rob Patro
member: rob-p
category: blog
tags:
  - rust
  - programming
  - bioinformatics
  - tools
  - computer science
---

As has been well noted on the interwebs, I am a staunch advocate of the [Rust](https://www.rust-lang.org) 
programming language.  This is particularly true in my home domain of bioinformatics and computational biology.
In fact, so persistent am I in my advocacy for the use of Rust in bioinformatics applications that [some of my colleagues](https://kamimrcht.github.io/webpage/)
have claimed [I am an overfit bot](https://twitter.com/CamilleMrcht/status/1522609312006344705?s=20&t=xH6INShi5gwSSHIZlqfoDw).

So, an obvious question a reader may ask is "why?".  Why am I so zealous in my advocacy for Rust and its use in 
Bioinformatics?  What benefits do I think it provides over the alternatives? What even are the alternatives? 
Are there places in bioinformatics where I *don't* think Rust is the right choice?

I intended this post to be an initial foray into addressing these questions, but quickly realized that, at least with 
the current queue of things that need my attention, a sprawling, long-form blog post was not the way to go.
Therefore, I am hopeful that this will become a series of posts, each one small and bite-sized, that together 
lay out some of my thoughts on the use of Rust in bioinformatics, each touching on a smaller piece of the whole 
picture. Yet, my prior blogging discipline is lacking, so I will make promises at this point about the length or 
frequency of this series.  So, without further ado, let's get started.

In today's post, I simply wish to define the problem space, that is usually implicit in my comments, when I advocate
for the use of Rust in bioinformatics.

### Defining the problem space

When I advocate for the use of Rust as a language for developing bioinformatics methods and tools, I do so from my own
particular perspective. Bioinformatics is a *giant* field, with many sub-disciplines, problem areas, and methodological
approaches.  Perhaps, Rust is applicable everywhere here, but that is not the argument I mean to make.  Rather, I would like 
to advocate for the use of Rust when developing tools and methods for *data-intensive*, *high-throughput* analysis.  

The types of applications I have in mind are sequencing indexing, read mapping and alignment, genome and transcriptome assembly, bulk and
single-cell RNA-seq and metagenomic quantification, etc.  These applications are characterized by a need to process a large volume 
of input data --- often what many consider as *raw* input data. These applications have several characteristics that tie them together.
They often require reading and sometimes writing large quantities of data.  They often require low-level and / or binary parsing and 
interpretation of records.  Given the problem sizes we encounter in practice, these are usually applications where memory usage is a 
concern and so they often rely on efficient (in space and time) implementation specific data structures.  Further, in many such applications,
memory needs are often semi-regular and predictable.  Also, these applications often have components or subroutines that 
can be made embarrassingly parallel.  There are other things such problems have in common, but these will suffice for now.

This, of course, leaves out huge areas of bioinformatics --- problems where we have processed or pre-processed data, and we want to perform 
exploratory data analysis, or particular types of statistical testing, or do certain types of dynamical modeling.  It is not that I *don't*
think Rust could be a compelling choice for these types of applications (though I have my doubts about exploratory data analysis), it is just 
that these are not the application areas where I typically work, and so they are not the areas where I have the experience or confidence 
to advocate for Rust (yet).

### So what other languages occupy this space?

To argue for what makes Rust compelling, I first have to lay out what I think are the other common (and, perhaps, not-so-common) languages
used for these types of problems.  

#### C and C++

Perhaps the most common languages are C and C++.  I mention these together, as is common, but it is 
critical to understand that they are *very* different languages.  The C language is relatively small and in many senses minimalistic. It
provides a small set of tools for modeling problems and for interacting with the system. It has a standard library, but a comparatively 
small one by modern standards, and things like collections must be written or provided as third-party libraries. I won't say too much 
else about C here specifically, except that almost all the issues I raise about safety with respect to C++, and often times they are
even worse.  Since the C type system isn't as rich as the one in C++, C often makes specific procedures generic by simply casting around 
data into a payload (e.g. a `void*`) rather than generating type-safe code for specific invocations at compile-time (e.g. C++'s templates 
and monomorphization).

As opposed to C, the C++ language is a giant monster.  First, you must ask, to which C++ is one referring? C++98, C++03, C++11, C++14, C++17, C++20?
If we consider the modern variants of C++ (e.g. C++11 and later), then these languages have added many useful features (but also a huge amount of 
complexity) to what they offer.  While there is a substantial amount shared between Rust and C++ that I hope to cover in future posts, one of the 
biggest areas they differ is in the way that they handle "safety" — that is, how the user interacts with memory and mutable data, and how those 
interactions affect program behavior and state. Put simply, Rust aims to be a *safe* language (with the option to perform tightly-scoped 
unsafe operations via the use of the `unsafe` keyword), while C++ is absolutely *not* a safe language.  Now, to be sure, many in the C++ 
community have recognized the importance of safety — how unsafe code can lead to security vulnerabilities, incorrect results, and unexpected 
program crashes or other behavior.  However, the language itself has incredibly limited support in terms of tools to helping the programmer 
to write safe code. Though there are efforts at laying out best practice [like the C++ core guidelines](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines),
there is a **huge** qualitative difference between best practice guidelines that a programmer should know and follow, versus safety guarantees
provided by the language and compiler itself.  There are many other differences between these languages, but I'll stake out the approach to 
safety to be perhaps the most salient.

#### The AoT, compiled, GC languages

While they are perhaps less-widely used for tools like the ones I've laid out above, there are a host of languages that are still designed 
to provide the computational performance necessary to accomplish such tasks. Here, I'll group together the most popular ahead-of-time (AoT) 
compiled and garbage collected (GC) languages.  This includes languages like Java (and other JVM languages like Scala and Kotlin), as well as 
different languages that nonetheless adopt the GC approach to memory safety, like Go. There are also languages that mix in a GC with other memory management strategies and provide the user with "opt-in" garbage collection 
(e.g. D and Nim).  However, since people using these languages tend to produce programs that eventually make use of GC somewhat,  I'm grouping them in here,
though technically there are ways to avoid the GC there.

These languages go a very different route that C/C++, and they do, to a large extent, provide important types of memory safety. However, they 
do this at the runtime cost of having a garbage collector, a runtime component of the language that tracks allocated memory and is responsible 
for ensuring that memory is kept alive while it can still be accessed and freed (eventually) when it is no longer in use.  The progress in the 
theory and practice of building scalable garbage collectors has been astounding, and many modern GCs are marvels of engineering. Nonetheless, 
the very presence of a GC imposes a runtime overhead in the presence of heap allocations, and it has been observed that idiomatic reliance on 
the GC for memory management can typically impose a memory overhead of up to 2 times over languages where memory is managed manually (and 
responsibly).  One reason for this (though not the only one) is that such languages tend to make many more heap allocations than languages 
like C/C++/Rust, and store fewer things on the stack. So, the place where these differences show up most frequently when comparing GC'd languages to something like C/C++/Rust is that (a) the 
GC'd languages typically use a constant factor more memory and (b) long-running or memory intensive processes typically incur GC "pauses" 
when the garbage collector kicks in to reclaim large amounts of memory.  Of course, there are several strategies that can be (and often are)
used to mitigate these issues (e.g. like retaining and using small object pools to avoid the garbage collector becoming involved in common and 
reusable allocations), however such strategies often require extra work (sometimes substantial), and are typically not idiomatic in the language.

Therefore, AoT compiled GC'd languages can be quite fast (though typically they take some speed hit compared C/C++/Rust), and they are, in many 
important ways *safe*, but this often comes at the expense of GC overhead in terms of both runtime and memory usage.

#### Others 

The list above is in no way meant to be comprehensive. Further, as we have been going through a renaissance of types in the development of new 
programming languages, there are also many other (*newish*) languages that could reasonably by said to occupy a similar space. For example, a language 
like [Zig](https://ziglang.org/) aims to be a modern systems-level language, and brings with it some very compelling features.  Since I don't know too much 
about these other emerging languages (including Zig), I won't attempt to contrast them too deeply with Rust.  However, I'll note that while Zig adds features 
on top of C that are a boon for safety, it *explicitly* does not make the same guarantees or claims on safety as does Rust.  There are also other langauges 
like [Pony](https://www.ponylang.io/) of whose existence I am aware, but about which I know even less.  Thus, I won't be trying to argue in future posts that 
Rust is the *only* new laguage that is well-suited to developing high-throuhgput bioinformatics tools and methods, but rather that it **is** a great choice 
for this task, and that in the space of such *newish* languages, it is certainly one of the most widely-adopted and mature.
