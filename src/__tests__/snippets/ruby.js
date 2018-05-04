export default `# Pick a random number.
rno = rand(100) + 1
print "Your magic number is ", rno, "\n"

# Perform all sort of totally uselss test on it and report the results.
if rno % 2 == 1 then
    print "Ooooh, that's an odd number.\n"
else
    print "That's an even number.\n"
    if rno > 2 then
        print "It's not prime, BTW.\n"
    end
end

if rno > 50
    print "That's more than half as big as it could be!\n"
elsif rno == 42
    print "That's the ultimate magic number!!!!\n"
elsif rno < 10
    print "That's pretty small, actually.\n"
else
    print "What a boring number.\n"
end

if rno == 100 then print "Gosh, you've maxxed out!\n" end`
