function visualize_beam(config)
%定义截面
v=[[1 0 1]', [-1 0 1]',[ -1 0 -1]',[1 0 -1]']/20;
f = [1 2 3 4]; hold on
[~,~,k]=size(config);
for i=1:k
    temp=config(1:3,1:3,i)*v+[config(1:3,4,i),config(1:3,4,i),config(1:3,4,i),config(1:3,4,i)];
    E(:,i)=config(1:3,4,i);
    if mod(i,11)==1
    patch('Faces',f,'Vertices',temp','FaceColor','blue');
    end
end
plot3(E(1,:),E(2,:),E(3,:),'red');
axis equal
[x y z]=sphere(24); h = surfl(2*pi/3*x, 2*pi/3*y, 2*pi/3*z); set(h, 'FaceAlpha', 0.1,'edgecolor','none'); 
axis([-2.5 2.5 -2.5 2.5 -2.5 2.5]);
ylabel('E_2');zlabel('E_3'); grid on; view(-49,13) 
hold off 
end
