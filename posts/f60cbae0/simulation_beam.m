function simulation_beam()
load result.mat
%可视化梁
[~,K,N]=size(output_xi_t);
theta=linspace(0,2*pi/3,K);
for i=1:K
    config(:,:,i)=[1 0 0 0; 0 1 0 theta(i);0 0 1 0;0 0 0 1];
end
visualize_beam(config);
traj=config(1:3,4,end);
fprintf('step3.重构开始!')
R=4e2;
step=0;

for i=1:N
    for j=1:K
        temp(:,:,j)=config(:,:,j);
        config(:,:,j)=temp(:,:,j)*cayley(delta_t,output_xi_t(:,j,i));  %cayley
    end
        if(mod(i,R)==0)
            clf
            step=step+1;
            traj(:,step+1)=config(1:3,4,end); plot3(traj(1,:),traj(2,:),traj(3,:),'.red');
            visualize_beam(config);
            drawnow            
        end    
end
end

function output=cayley(delta_t,xi_t)
temp=VecTose3(delta_t*xi_t);
output=(eye(4)-temp/2)\(eye(4)+temp/2);%论文中除了2,有待核对
end

function se3mat = VecTose3(V)
se3mat = [VecToso3(V(1: 3)), V(4: 6); 0, 0, 0, 0];
end

function so3mat = VecToso3(omg)
so3mat = [0, -omg(3), omg(2); omg(3), 0, -omg(1); -omg(2), omg(1), 0];
end