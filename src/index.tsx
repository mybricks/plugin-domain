import pkg from '../package.json';

console.log(`%c ${pkg.name} %c@${pkg.version}`, `color:#FFF;background:#fa6400`, ``, ``);

export default function note(): any {
  return {
    name: '@mybricks/plugins/domain',
    title: 'note',
    author: 'MyBricks Team',
    ['author.zh']: 'MyBricks团队',
    version: '1.0.0',
    description: 'Domain Plugin',
    contributes: {
      geoView: {
        domainModel: {
          type: 'default',
          render(args: any): JSX.Element {

          }
        }
      }
    },
    onLoad({data, domainModel}) {
      domainModel.getAll = () => {
        return [
          {
            id: 'd0',
            title: '学生',
            fields: [
              {
                name: 'name',
                title: '姓名',
                type: 'string'
              },
              {
                name: 'age',
                title: '年龄',
                type: 'number'
              }
            ],
            services: [
              {
                name: 'getStudent',
                title: '查询',
                default: true,
                params: [
                  {
                    name: 'name',
                    title: '姓名',
                    type: 'string'
                  }
                ],
                returnType: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string'
                      },
                      name: {
                        type: 'string'
                      },
                      age: {
                        type: 'number'
                      }
                    }
                  }
                }
              },
              {
                name: 'deleteStudent',
                title: '删除',
                params: [
                  {
                    name: 'name',
                    title: '姓名',
                    type: 'string'
                  }
                ],
                returnType: {
                  type: 'number'
                }
              }
            ]
          }
        ]
      }
    },
    beforeDump({data}: { data: T_Data }): void {

    }
  };
}