root@ipstaging-paperio-ubuntu-s-1vcpu-1gb-fra1-01:~# sshd -T | grep -iE '^(allowusers|allowgroups)'
allowusers root
allowusers deploy
allowusers paperio-user
allowusers pickmajob-user
root@ipstaging-paperio-ubuntu-s-1vcpu-1gb-fra1-01:~# install -d -m 700 -o pranayoga -g pranayoga /home/pranayoga/.ssh
root@ipstaging-paperio-ubuntu-s-1vcpu-1gb-fra1-01:~# echo '<the line you copied>' >> /home/pranayoga/.ssh/authorized_keys
root@ipstaging-paperio-ubuntu-s-1vcpu-1gb-fra1-01:~# chown pranayoga:pranayoga /home/pranayoga/.ssh/authorized_keys && chmod 600 /home/pranayoga/.ssh/authorized_keys
root@ipstaging-paperio-ubuntu-s-1vcpu-1gb-fra1-01:~# grep -rnE '^\s*AllowUsers' /etc/ssh/sshd_config /etc/ssh/sshd_config.d/   # file:line:text
/etc/ssh/sshd_config:1:AllowUsers root deploy paperio-user pickmajob-user
root@ipstaging-paperio-ubuntu-s-1vcpu-1gb-fra1-01:~# cp <file> <file>.bak
-bash: syntax error near unexpected token `<'
root@ipstaging-paperio-ubuntu-s-1vcpu-1gb-fra1-01:~# cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak
root@ipstaging-paperio-ubuntu-s-1vcpu-1gb-fra1-01:~# sed -i '<line>s/$/ pranayoga/' /etc/ssh/sshd_config
sed: -e expression #1, char 1: unknown command: `<'
root@ipstaging-paperio-ubuntu-s-1vcpu-1gb-fra1-01:~# sed -i '1s/$/ pranayoga/' /etc/ssh/sshd_config
root@ipstaging-paperio-ubuntu-s-1vcpu-1gb-fra1-01:~# sshd -t && systemctl reload ssh
3root@ipstaging-paperio-ubuntu-s-1vcpu-1gb-fra1-01:~# sshd -T | grep -i '^allowusers'
allowusers root
allowusers deploy
allowusers paperio-user
allowusers pickmajob-user
allowusers pranayoga
root@ipstaging-paperio-ubuntu-s-1vcpu-1gb-fra1-01:~# ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub
256 SHA256:nUX3eebLC5xgR8gcvlQkeQx2JfIrop/fLNKjv8Sq2N4 root@ubuntu-s-1vcpu-1gb-fra1-01 (ED25519)
root@ipstaging-paperio-ubuntu-s-1vcpu-1gb-fra1-01:~# ^C
root@ipstaging-paperio-ubuntu-s-1vcpu-1gb-fra1-01:~# ^C
root@ipstaging-paperio-ubuntu-s-1vcpu-1gb-fra1-01:~# 



PS D:\pranayoga-website> ssh-keygen -t ed25519
Generating public/private ed25519 key pair.
Enter file in which to save the key (C:\Users\user/.ssh/id_ed25519):
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in C:\Users\user/.ssh/id_ed25519
Your public key has been saved in C:\Users\user/.ssh/id_ed25519.pub
The key fingerprint is:
SHA256:HeQHkmP5ojUGqr6ScFAgESZWxq4B5wSPthVJpTRyTi0 user@DanieloWaller
The key's randomart image is:
+--[ED25519 256]--+
|BO+X+.  .oo      |
|*o@E+.. =+ .     |
|o*o+.. o oo .    |
|o.+..   =..o     |
| oo.   +So.      |
|..o   .          |
|.+               |
|o .              |
| ...             |
+----[SHA256]-----+
PS D:\pranayoga-website> Get-Content $HOME\.ssh\id_ed25519.pub
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIE6PeVnHgw6GC+ljtb/0hNVHmeX94PwDXtklp6KKRily user@DanieloWaller
PS D:\pranayoga-website> ssh-keygen -l -F "[157.230.106.236]:2222"
# Host [157.230.106.236]:2222 found: line 6
[157.230.106.236]:2222 ED25519 SHA256:nUX3eebLC5xgR8gcvlQkeQx2JfIrop/fLNKjv8Sq2N4
PS D:\pranayoga-website> ssh -p 2222 pranayoga@<157.230.106.236> whoami
hostname contains invalid characters
PS D:\pranayoga-website> ssh -p 2222 pranayoga@157.230.106.236 whoami
pranayoga@157.230.106.236: Permission denied (publickey).
PS D:\pranayoga-website>